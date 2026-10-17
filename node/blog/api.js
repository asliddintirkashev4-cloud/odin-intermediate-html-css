import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { body, validationResult, matchedData } from 'express-validator';
const writer = { select: { firstName: true, lastName: true } };
const idOf = value => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647 ? Number(value) : null;
export function blogApi(prisma, secret, origins = '') {
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters.');
  const router = Router();
  const allowed = origins.split(',').map(v => v.trim()).filter(Boolean);
  router.use(cors({ origin: allowed.length ? (origin, done) => done(null, !origin || allowed.includes(origin)) : true }));
  const loginLimit = rateLimit({ windowMs: 15 * 60000, limit: 40, standardHeaders: 'draft-8', legacyHeaders: false });
  const commentLimit = rateLimit({ windowMs: 60000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false });
  router.post('/auth/login', loginLimit, [body('email').trim().isEmail().toLowerCase(), body('password').isString().isLength({ min: 1, max: 200 })], async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Email and password are required.' });
    const user = await prisma.user.findUnique({ where: { email: matchedData(req).email } });
    if (!user || !await bcrypt.compare(req.body.password, user.passwordHash)) return res.status(401).json({ error: 'Email or password was not accepted.' });
    if (!user.admin) return res.status(403).json({ error: 'An author account is required.' });
    const token = jwt.sign({}, secret, { algorithm: 'HS256', subject: String(user.id), expiresIn: '1h', issuer: 'odin-blog', audience: 'odin-blog-author' });
    res.json({ token, expiresIn: 3600, user: { firstName: user.firstName, lastName: user.lastName } });
  });
  router.use(async (req, res, next) => {
    if (!req.get('authorization')) return next();
    const [scheme, token] = req.get('authorization').split(' ');
    if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Use a Bearer token.' });
    try {
      const payload = jwt.verify(token, secret, { algorithms: ['HS256'], issuer: 'odin-blog', audience: 'odin-blog-author' });
      const id = idOf(payload.sub);
      const user = id && await prisma.user.findUnique({ where: { id }, select: { id: true, admin: true } });
      if (!user?.admin) return res.status(401).json({ error: 'Author access is no longer available.' });
      req.author = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') return res.status(401).json({ error: 'Sign in again; your token is invalid or expired.' });
      next(error);
    }
  });
  const requireAuthor = (req, res, next) => req.author ? next() : res.status(401).json({ error: 'Author authentication is required.' });
  router.param('id', (req, res, next, value) => { req.postId = idOf(value); if (!req.postId) return res.status(400).json({ error: 'Invalid post ID.' }); next(); });
  router.param('commentId', (req, res, next, value) => { req.commentId = idOf(value); if (!req.commentId) return res.status(400).json({ error: 'Invalid comment ID.' }); next(); });
  router.get('/posts', async (req, res) => {
    if (req.query.drafts === 'true' && !req.author) return res.status(401).json({ error: 'Sign in to view drafts.' });
    const posts = await prisma.blogPost.findMany({ where: req.author && req.query.drafts === 'true' ? {} : { published: true }, orderBy: { createdAt: 'desc' }, take: 100, include: { author: writer, _count: { select: { comments: true } } } });
    res.json({ posts });
  });
  router.get('/posts/:id', async (req, res) => {
    const post = await prisma.blogPost.findFirst({ where: { id: req.postId, ...(req.author ? {} : { published: true }) }, include: { author: writer, comments: { orderBy: { createdAt: 'asc' } } } });
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post });
  });
  const postFields = [body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1–200 characters.'), body('content').trim().isLength({ min: 1, max: 20000 }).withMessage('Content must be 1–20000 characters.'), body('published').isBoolean().withMessage('Published must be true or false.').toBoolean()];
  const check = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array().map(e => e.msg).join(' ') });
    next();
  };
  router.post('/posts', requireAuthor, postFields, check, async (req, res) => res.status(201).json({ post: await prisma.blogPost.create({ data: { ...matchedData(req), authorId: req.author.id } }) }));
  router.put('/posts/:id', requireAuthor, postFields, check, async (req, res) => res.json({ post: await prisma.blogPost.update({ where: { id: req.postId }, data: matchedData(req) }) }));
  router.delete('/posts/:id', requireAuthor, async (req, res) => { const result = await prisma.blogPost.deleteMany({ where: { id: req.postId } }); res.status(result.count ? 204 : 404).send(); });
  const commentFields = [body('name').trim().isLength({ min: 1, max: 80 }).withMessage('Name must be 1–80 characters.'), body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1–2000 characters.')];
  router.post('/posts/:id/comments', commentLimit, commentFields, check, async (req, res) => {
    if (!await prisma.blogPost.findFirst({ where: { id: req.postId, published: true } })) return res.status(404).json({ error: 'Post not found.' });
    res.status(201).json({ comment: await prisma.blogComment.create({ data: { ...matchedData(req), postId: req.postId } }) });
  });
  router.put('/posts/:id/comments/:commentId', requireAuthor, commentFields, check, async (req, res) => {
    const result = await prisma.blogComment.updateMany({ where: { id: req.commentId, postId: req.postId }, data: matchedData(req) });
    if (!result.count) return res.status(404).json({ error: 'Comment not found.' });
    res.json({ comment: await prisma.blogComment.findUnique({ where: { id: req.commentId } }) });
  });
  router.delete('/posts/:id/comments/:commentId', requireAuthor, async (req, res) => { const result = await prisma.blogComment.deleteMany({ where: { id: req.commentId, postId: req.postId } }); res.status(result.count ? 204 : 404).send(); });
  router.use((req, res) => res.status(404).json({ error: 'API route not found.' }));
  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.code === 'P2025') return res.status(404).json({ error: 'Record not found.' });
    console.error(error.message);
    res.status(500).json({ error: 'The request could not be completed.' });
  });
  return router;
}
