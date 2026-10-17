import { body, validationResult, matchedData } from 'express-validator';
import { authArea, requireUser } from '../lib/auth.js';
import { view } from '../lib/views.js';
const person = { id: true, firstName: true, lastName: true, bio: true, avatar: true };
export function messagesArea(options) {
  const { prisma } = options;
  const area = authArea({ ...options, name: 'messages' });
  const router = area.router;
  router.use(requireUser);
  router.get('/', async (req, res) => res.render(view('messages/index'), { title: 'Conversations', people: await prisma.user.findMany({ where: { id: { not: req.user.id } }, select: person, orderBy: { firstName: 'asc' }, take: 100 }) }));
  router.param('id', async (req, res, next, value) => {
    const id = /^\d+$/.test(value) && Number(value) <= 2147483647 ? Number(value) : null;
    req.recipient = id && id !== req.user.id ? await prisma.user.findUnique({ where: { id }, select: person }) : null;
    if (!req.recipient) return res.sendStatus(404);
    next();
  });
  router.get('/conversation/:id', async (req, res) => {
    const messages = await prisma.directMessage.findMany({ where: { OR: [{ senderId: req.user.id, recipientId: req.recipient.id }, { senderId: req.recipient.id, recipientId: req.user.id }] }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 100 });
    res.render(view('messages/conversation'), { title: req.recipient.firstName + ' ' + req.recipient.lastName, recipient: req.recipient, messages: messages.reverse() });
  });
  router.post('/conversation/:id', body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must contain 1–2000 characters.'), async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).render(view('views/error'), { title: 'Check your message', message: 'Enter between 1 and 2000 characters.' });
    await prisma.directMessage.create({ data: { text: matchedData(req).text, senderId: req.user.id, recipientId: req.recipient.id } });
    res.redirect(303, res.locals.base + '/conversation/' + req.recipient.id);
  });
  return area;
}
