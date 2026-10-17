import { body, validationResult, matchedData } from 'express-validator';
import { createHash, timingSafeEqual } from 'node:crypto';
import { authArea, requireUser } from '../lib/auth.js';
import { view } from '../lib/views.js';
const hash = v => createHash('sha256').update(String(v || '')).digest();
export function membersArea(options) {
  const { prisma } = options;
  const area = authArea({ ...options, name: 'members' });
  const router = area.router;
  router.get('/', async (req, res) => {
    const canSeeAuthors = req.user?.member || req.user?.admin;
    const messages = await prisma.clubMessage.findMany({ orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { id: true, title: true, text: true, ...(canSeeAuthors ? { createdAt: true, author: { select: { firstName: true, lastName: true } } } : {}) } });
    res.render(view('members/index'), { title: 'The reading room', messages });
  });
  router.get('/join', requireUser, (req, res) => res.render(view('members/join'), { title: 'Join the club' }));
  router.post('/join', requireUser, async (req, res) => {
    const isAdmin = req.body.role === 'admin';
    const expected = isAdmin ? options.adminPasscode : options.membersPasscode;
    if (!expected || !timingSafeEqual(hash(expected), hash(req.body.passcode))) return res.status(403).render(view('members/join'), { title: 'Join the club', errors: ['That passcode was not accepted.'] });
    await prisma.user.update({ where: { id: req.user.id }, data: isAdmin ? { admin: true, member: true } : { member: true } });
    res.redirect(303, res.locals.base + '/');
  });
  router.get('/new', requireUser, (req, res) => res.render(view('members/form'), { title: 'Write a message' }));
  router.post('/new', requireUser, [body('title').trim().isLength({ min: 1, max: 120 }).withMessage('Title must be 1–120 characters.'), body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1–2000 characters.')], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render(view('members/form'), { title: 'Write a message', errors: errors.array(), values: req.body });
    await prisma.clubMessage.create({ data: { ...matchedData(req), authorId: req.user.id } });
    res.redirect(303, res.locals.base + '/');
  });
  router.post('/messages/:id/delete', requireUser, async (req, res) => {
    if (!req.user.admin) return res.status(403).send('Only an administrator can delete messages.');
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647) return res.sendStatus(404);
    const result = await prisma.clubMessage.deleteMany({ where: { id } });
    if (!result.count) return res.sendStatus(404);
    res.redirect(303, res.locals.base + '/');
  });
  return area;
}
