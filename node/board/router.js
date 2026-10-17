import { Router } from 'express';
import { body, validationResult, matchedData } from 'express-validator';
import { messageModel } from './model.js';
import { context, view } from '../lib/views.js';

export function boardRouter(db) {
  const router = Router();
  const messages = messageModel(db);
  router.use(context);
  router.get('/', async (req, res) => res.render(view('board/index'), { title: 'Mini message board', messages: await messages.all() }));
  router.get('/new', (req, res) => res.render(view('board/form'), { title: 'Leave a message' }));
  router.post('/new', [
    body('user').trim().isLength({ min: 1, max: 80 }).withMessage('Author must be 1–80 characters.'),
    body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be 1–2000 characters.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render(view('board/form'), { title: 'Leave a message', errors: errors.array(), values: req.body });
    await messages.create(matchedData(req));
    res.redirect(303, res.locals.base + '/');
  });
  router.get('/messages/:id', async (req, res) => {
    const id = Number(req.params.id);
    const message = Number.isSafeInteger(id) && id > 0 && id <= 2147483647 ? await messages.get(id) : null;
    if (!message) return res.status(404).render(view('views/error'), { title: 'Message not found', message: 'This message does not exist.' });
    res.render(view('board/detail'), { title: 'Message details', message });
  });
  return router;
}
