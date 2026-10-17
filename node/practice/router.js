import { Router } from 'express';
import { body, validationResult, matchedData } from 'express-validator';
import { context, view } from '../lib/views.js';
export function practiceRouter(db) {
  const router = Router();
  router.use(context);
  const users = Router();
  router.get('/', async (req, res) => {
    const search = typeof req.query.search === 'string' ? req.query.search : '';
    const usernames = (await db.query('SELECT * FROM usernames WHERE username ILIKE $1 ORDER BY id', ['%' + search + '%'])).rows;
    res.render(view('practice/index'), { title: 'Express practice', usernames, search });
  });
  router.get('/about', (req, res) => res.render(view('practice/about'), { title: 'About the practice app' }));
  router.post('/usernames', body('username').trim().isLength({ min: 1, max: 80 }), async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).send('Username must be 1–80 characters.');
    await db.query('INSERT INTO usernames(username) VALUES($1)', [matchedData(req).username]);
    res.redirect(303, res.locals.base + '/');
  });
  router.get('/delete', async (req, res) => { await db.query('DELETE FROM usernames'); res.redirect(res.locals.base + '/'); });
  const books = Router();
  books.get('/', (req, res) => res.send('All books'));
  books.get('/:bookId/reserve', (req, res) => res.send('Reserve book ' + req.params.bookId));
  books.post('/:bookId/reserve', (req, res) => res.json({ reserved: req.params.bookId }));
  books.get('/:bookId', (req, res) => res.json({ bookId: req.params.bookId }));
  const authors = Router();
  authors.get('/', (req, res) => res.send('All authors'));
  authors.get('/:authorId', (req, res) => res.json({ authorId: req.params.authorId }));
  router.use('/books', books);
  router.use('/authors', authors);
  router.get('/contact', (req, res) => res.send('Contact form example'));
  router.post('/contact', (req, res) => res.json({ received: true }));
  router.get('/:username/messages/:messageId', (req, res) => res.json({ params: req.params, query: req.query }));
  router.get('/:username/messages', (req, res) => res.json({ params: req.params, query: req.query }));
  const validations = [
    body('firstName').trim().isAlpha().isLength({ min: 1, max: 80 }).withMessage('First name must contain letters (1–80).'),
    body('lastName').trim().isAlpha().isLength({ min: 1, max: 80 }).withMessage('Last name must contain letters (1–80).'),
    body('email').trim().isEmail().isLength({ max: 254 }).withMessage('A valid email is required.').toLowerCase(),
    body('age').optional({ values: 'falsy' }).isInt({ min: 18, max: 120 }).withMessage('Age must be 18–120.').toInt(),
    body('bio').trim().isLength({ max: 200 }).withMessage('Bio must not exceed 200 characters.')
  ];
  const getUser = async id => /^\d+$/.test(id) && Number(id) <= 2147483647 ? (await db.query('SELECT * FROM practice_users WHERE id=$1', [id])).rows[0] : null;
  users.get('/', async (req, res) => res.render(view('practice/users'), { title: 'Demo users', users: (await db.query('SELECT * FROM practice_users ORDER BY id')).rows, search: {} }));
  users.get('/create', (req, res) => res.render(view('practice/form'), { title: 'Create demo user', id: null }));
  users.post('/create', validations, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render(view('practice/form'), { title: 'Create demo user', id: null, values: req.body, errors: errors.array() });
    const v = matchedData(req);
    await db.query('INSERT INTO practice_users(first_name,last_name,email,age,bio) VALUES($1,$2,$3,$4,$5)', [v.firstName, v.lastName, v.email, v.age || null, v.bio]);
    res.redirect(303, res.locals.base + '/users');
  });
  users.get('/:id/update', async (req, res) => {
    const user = await getUser(req.params.id);
    if (!user) return res.sendStatus(404);
    res.render(view('practice/form'), { title: 'Update demo user', id: user.id, values: { firstName: user.first_name, lastName: user.last_name, ...user } });
  });
  users.post('/:id/update', validations, async (req, res) => {
    if (!await getUser(req.params.id)) return res.sendStatus(404);
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).render(view('practice/form'), { title: 'Update demo user', id: req.params.id, values: req.body, errors: errors.array() });
    const v = matchedData(req);
    await db.query('UPDATE practice_users SET first_name=$1,last_name=$2,email=$3,age=$4,bio=$5 WHERE id=$6', [v.firstName, v.lastName, v.email, v.age || null, v.bio, req.params.id]);
    res.redirect(303, res.locals.base + '/users');
  });
  users.post('/:id/delete', async (req, res) => { if (!await getUser(req.params.id)) return res.sendStatus(404); await db.query('DELETE FROM practice_users WHERE id=$1', [req.params.id]); res.redirect(303, res.locals.base + '/users'); });
  router.use('/users', users);
  router.get('/search', async (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name : '';
    const email = typeof req.query.email === 'string' ? req.query.email : '';
    const results = (await db.query("SELECT * FROM practice_users WHERE concat(first_name,' ',last_name) ILIKE $1 AND email ILIKE $2 ORDER BY id", ['%' + name + '%', '%' + email + '%'])).rows;
    res.render(view('practice/search'), { title: 'Search results', users: results, search: { name, email } });
  });
  return router;
}
