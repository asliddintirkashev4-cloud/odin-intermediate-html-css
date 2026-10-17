import { body, validationResult, matchedData } from 'express-validator';
import { authArea, requireUser } from '../lib/auth.js';
import { view } from '../lib/views.js';
const person = { id: true, firstName: true, lastName: true, bio: true, avatar: true };
const author = { select: person };
const postDetails = { author, comments: { include: { author }, orderBy: { createdAt: 'asc' } }, likes: { select: { userId: true } } };
const toId = value => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647 ? Number(value) : null;
export function bookArea(options) {
  const { prisma } = options;
  const area = authArea({ ...options, name: 'book' });
  const router = area.router;
  router.use(requireUser);
  router.param('id', (req, res, next, value) => { req.recordId = toId(value); req.recordId ? next() : res.sendStatus(404); });
  router.get('/', async (req, res) => {
    const following = await prisma.follow.findMany({ where: { followerId: req.user.id, accepted: true }, select: { followingId: true } });
    const posts = await prisma.socialPost.findMany({ where: { authorId: { in: [req.user.id, ...following.map(f => f.followingId)] } }, include: postDetails, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 50 });
    res.render(view('book/feed'), { title: 'Your circle', posts });
  });
  router.get('/people', async (req, res) => {
    const people = await prisma.user.findMany({ select: person, orderBy: { firstName: 'asc' }, take: 100 });
    const requests = await prisma.follow.findMany({ where: { OR: [{ followerId: req.user.id }, { followingId: req.user.id }] } });
    res.render(view('book/people'), { title: 'Find your people', people, requests });
  });
  router.get('/people/:id', async (req, res) => {
    const profile = await prisma.user.findUnique({ where: { id: req.recordId }, select: person });
    if (!profile) return res.sendStatus(404);
    const posts = await prisma.socialPost.findMany({ where: { authorId: profile.id }, include: postDetails, orderBy: { createdAt: 'desc' }, take: 50 });
    res.render(view('book/person'), { title: profile.firstName + ' ' + profile.lastName, profile, posts });
  });
  router.post('/people/:id/follow', async (req, res) => {
    if (req.recordId === req.user.id || !await prisma.user.findUnique({ where: { id: req.recordId }, select: { id: true } })) return res.sendStatus(400);
    await prisma.follow.upsert({ where: { followerId_followingId: { followerId: req.user.id, followingId: req.recordId } }, create: { followerId: req.user.id, followingId: req.recordId }, update: {} });
    res.redirect(303, res.locals.base + '/people');
  });
  router.post('/people/:id/unfollow', async (req, res) => { await prisma.follow.deleteMany({ where: { followerId: req.user.id, followingId: req.recordId } }); res.redirect(303, res.locals.base + '/people'); });
  router.post('/people/:id/accept', async (req, res) => {
    const result = await prisma.follow.updateMany({ where: { followerId: req.recordId, followingId: req.user.id, accepted: false }, data: { accepted: true } });
    if (!result.count) return res.sendStatus(404);
    res.redirect(303, res.locals.base + '/people');
  });
  router.post('/people/:id/decline', async (req, res) => { await prisma.follow.deleteMany({ where: { followerId: req.recordId, followingId: req.user.id, accepted: false } }); res.redirect(303, res.locals.base + '/people'); });
  router.post('/posts', body('text').trim().isLength({ min: 1, max: 4000 }).withMessage('Post must contain 1–4000 characters.'), async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).render(view('views/error'), { title: 'Check your post', message: 'Write between 1 and 4000 characters.' });
    await prisma.socialPost.create({ data: { text: matchedData(req).text, authorId: req.user.id } });
    res.redirect(303, res.locals.base + '/');
  });
  router.post('/posts/:id/delete', async (req, res) => { const result = await prisma.socialPost.deleteMany({ where: { id: req.recordId, authorId: req.user.id } }); if (!result.count) return res.sendStatus(404); res.redirect(303, res.locals.base + '/'); });
  router.post('/posts/:id/like', async (req, res) => {
    if (!await prisma.socialPost.findUnique({ where: { id: req.recordId }, select: { id: true } })) return res.sendStatus(404);
    await prisma.like.upsert({ where: { userId_postId: { userId: req.user.id, postId: req.recordId } }, create: { userId: req.user.id, postId: req.recordId }, update: {} });
    res.redirect(303, res.locals.base + '/');
  });
  router.post('/posts/:id/unlike', async (req, res) => { await prisma.like.deleteMany({ where: { userId: req.user.id, postId: req.recordId } }); res.redirect(303, res.locals.base + '/'); });
  router.post('/posts/:id/comments', body('text').trim().isLength({ min: 1, max: 2000 }), async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).send('Comment must contain 1–2000 characters.');
    if (!await prisma.socialPost.findUnique({ where: { id: req.recordId }, select: { id: true } })) return res.sendStatus(404);
    await prisma.socialComment.create({ data: { text: matchedData(req).text, authorId: req.user.id, postId: req.recordId } });
    res.redirect(303, res.locals.base + '/');
  });
  return area;
}
