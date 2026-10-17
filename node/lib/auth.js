import { Router } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { Passport } from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { body, validationResult, matchedData } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { context, view } from './views.js';
export const publicUser = { id: true, email: true, firstName: true, lastName: true, member: true, admin: true, bio: true, avatar: true };
export const requireUser = (req, res, next) => req.user ? next() : res.redirect(res.locals.base + '/login');
export function originGuard(req, res, next) {
  const origin = req.get('origin');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && origin) {
    if (origin === 'null' && validCsrf(req)) return next();
    try { if (new URL(origin).host !== req.get('host')) return res.status(403).send('Request origin was not accepted.'); }
    catch { return res.status(403).send('Request origin was not accepted.'); }
  }
  next();
}
function validCsrf(req) {
  const sent = req.get('x-csrf-token') || req.body?._csrf;
  const expected = req.session?.csrf;
  return typeof sent === 'string' && /^[a-f0-9]{64}$/.test(sent) && typeof expected === 'string' && sent.length === expected.length && timingSafeEqual(Buffer.from(sent), Buffer.from(expected));
}
export function csrfGuard(req, res, next) {
  if (!validCsrf(req)) return res.status(403).send('The form expired. Reload the page and try again.');
  originGuard(req, res, next);
}

export function authArea({ prisma, db, name, secret, prismaStore = false, production = false }) {
  if (!secret || secret.length < 32) throw new Error('A SESSION_SECRET of at least 32 characters is required.');
  const router = Router();
  const passport = new Passport();
  const PgStore = connectPgSimple(session);
  const store = prismaStore ? new PrismaSessionStore(prisma, { checkPeriod: 120000, dbRecordIdIsSessionId: true }) : new PgStore({ pool: db, tableName: name + '_sessions', createTableIfMissing: false });
  passport.use(new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
      if (!user || !await bcrypt.compare(password, user.passwordHash)) return done(null, false);
      const { passwordHash, ...safeUser } = user;
      done(null, safeUser);
    } catch (error) { done(error); }
  }));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try { done(null, await prisma.user.findUnique({ where: { id }, select: publicUser })); }
    catch (error) { done(error); }
  });
  router.use(session({ name: name + '.sid', secret, store, resave: false, saveUninitialized: false, cookie: { httpOnly: true, sameSite: 'lax', secure: production, path: '/' + name, maxAge: 7 * 86400000 } }));
  router.use(passport.session());
  router.use((req, res, next) => {
    req.session.csrf ||= randomBytes(32).toString('hex');
    res.locals.csrf = req.session.csrf;
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !(req.path === '/upload' && req.is('multipart/form-data'))) return csrfGuard(req, res, next);
    next();
  });
  router.use(context);
  const limiter = rateLimit({ windowMs: 15 * 60000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false });
  router.get('/signup', (req, res) => res.render(view('auth/signup'), { title: 'Create an account' }));
  router.post('/signup', limiter, [
    body('firstName').trim().isLength({ min: 1, max: 80 }).withMessage('First name is required (up to 80 characters).'),
    body('lastName').trim().isLength({ min: 1, max: 80 }).withMessage('Last name is required (up to 80 characters).'),
    body('email').trim().isEmail().isLength({ max: 254 }).withMessage('Enter a valid email.').toLowerCase(),
    body('password').isLength({ min: 10 }).custom(v => Buffer.byteLength(v) <= 72).withMessage('Password must be at least 10 characters and at most 72 bytes.'),
    body('confirmPassword').custom((v, { req }) => v === req.body.password).withMessage('Passwords must match.')
  ], async (req, res, next) => {
    const errors = validationResult(req);
    const { firstName, lastName, email } = req.body;
    const values = { firstName, lastName, email };
    if (!errors.isEmpty()) return res.status(400).render(view('auth/signup'), { title: 'Create an account', errors: errors.array(), values });
    const data = matchedData(req);
    try {
      const user = await prisma.user.create({ data: { firstName: data.firstName, lastName: data.lastName, email: data.email, passwordHash: await bcrypt.hash(data.password, 12) }, select: publicUser });
      req.logIn(user, error => error ? next(error) : res.redirect(303, res.locals.base + '/'));
    } catch (error) {
      if (error.code === 'P2002') return res.status(409).render(view('auth/signup'), { title: 'Create an account', values, errors: ['That email is already registered. Try signing in.'] });
      next(error);
    }
  });
  router.get('/login', (req, res) => res.render(view('auth/login'), { title: 'Welcome back' }));
  router.post('/login', limiter, (req, res, next) => {
    passport.authenticate('local', (error, user) => {
      if (error) return next(error);
      if (!user) return res.status(401).render(view('auth/login'), { title: 'Welcome back', errors: ['Email or password was not accepted.'] });
      req.logIn(user, error => error ? next(error) : res.redirect(303, res.locals.base + '/'));
    })(req, res, next);
  });
  router.post('/logout', (req, res, next) => req.logout(error => {
    if (error) return next(error);
    req.session.destroy(error => error ? next(error) : res.redirect(303, res.locals.base + '/login'));
  }));
  router.get('/profile', requireUser, (req, res) => res.render(view('auth/profile'), { title: 'Your profile', values: req.user }));
  router.post('/profile', requireUser, [
    body('firstName').trim().isLength({ min: 1, max: 80 }).withMessage('First name is required.'),
    body('lastName').trim().isLength({ min: 1, max: 80 }).withMessage('Last name is required.'),
    body('bio').trim().isLength({ max: 200 }).withMessage('Bio must be at most 200 characters.'),
    body('avatar').trim().optional({ values: 'falsy' }).isURL({ protocols: ['https'], require_protocol: true }).withMessage('Profile image must use an https URL.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render(view('auth/profile'), { title: 'Your profile', values: req.body, errors: errors.array() });
    const data = matchedData(req);
    if (!req.body.avatar) data.avatar = '';
    await prisma.user.update({ where: { id: req.user.id }, data });
    res.redirect(303, res.locals.base + '/profile');
  });
  return { router, store };
}
