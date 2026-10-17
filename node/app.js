import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'node:url';
import { informationalRouter } from './basic-site/express.js';
import { boardRouter } from './board/router.js';
import { inventoryRouter } from './inventory/router.js';
import { membersArea } from './members/router.js';
import { practiceRouter } from './practice/router.js';
import { filesArea } from './files/router.js';
import { blogApi } from './blog/api.js';
import { messagesArea } from './messages/router.js';
import { bookArea } from './book/router.js';
import { huntApi } from './hunt/api.js';
import { context, view } from './lib/views.js';

export function createApp(db, options = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.use(helmet({ contentSecurityPolicy: { directives: { 'script-src': ["'self'"], 'style-src': ["'self'", "'unsafe-inline'"], 'img-src': ["'self'", 'data:', 'https:'] } } }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));
  app.use(express.json({ limit: '32kb' }));
  app.use('/assets', express.static(fileURLToPath(new URL('public', import.meta.url))));
  app.use('/info', informationalRouter());
  app.use('/board', boardRouter(db));
  app.use('/inventory', inventoryRouter(db, options.adminPasscode || process.env.ADMIN_PASSCODE));
  app.use('/practice', practiceRouter(db));
  const stores = [];
  if (options.prisma) {
    const members = membersArea({ db, prisma: options.prisma, secret: process.env.SESSION_SECRET, adminPasscode: options.adminPasscode || process.env.ADMIN_PASSCODE, membersPasscode: options.membersPasscode || process.env.MEMBERS_PASSCODE, production: process.env.NODE_ENV === 'production' });
    stores.push(members.store);
    app.use('/members', members.router);
    const files = filesArea({ db, prisma: options.prisma, secret: process.env.SESSION_SECRET, production: process.env.NODE_ENV === 'production', fileStorage: options.fileStorage });
    stores.push(files.store);
    app.use('/files', files.router);
    app.use('/blog/api', blogApi(options.prisma, process.env.JWT_SECRET, process.env.FRONTEND_ORIGINS));
    app.use('/blog', express.static(fileURLToPath(new URL('blog/public', import.meta.url))));
    const shared = { db, prisma: options.prisma, secret: process.env.SESSION_SECRET, production: process.env.NODE_ENV === 'production' };
    const messages = messagesArea(shared);
    const book = bookArea(shared);
    stores.push(messages.store, book.store);
    app.use('/messages', messages.router);
    app.use('/book', book.router);
    app.use('/hunt/api', huntApi(options.prisma));
    app.use('/hunt', express.static(fileURLToPath(new URL('hunt/public', import.meta.url))));
  }
  app.locals.sessionStores = stores;
  app.get('/health', async (req, res) => { try { await db.query('SELECT 1'); res.json({ status: 'ok' }); } catch { res.status(503).json({ status: 'unavailable' }); } });
  app.get('/', context, (req, res) => res.render(view('views/home'), { title: 'Server workshop', projects: [
    { name: 'Informational site', tag: '01 / HTTP', path: '/info/', description: 'A native Node server and an Express rewrite.' },
    { name: 'Mini message board', tag: '02 / EXPRESS + POSTGRESQL', path: '/board/', description: 'Write a note and open its details.' },
    { name: 'Inventory', tag: '03 / RELATIONAL DATA', path: '/inventory/', description: 'Manage stationery, categories, stock and prices.' },
    { name: 'Members Only', tag: '04 / PASSPORT + ROLES', path: '/members/', description: 'A message club with membership and moderation.' },
    { name: 'File Uploader', tag: '05 / PRISMA + PRIVATE STORAGE', path: '/files/', description: 'Create folders and upload or download your files.' },
    { name: 'Blog', tag: '06 / REST + JWT', path: '/blog/', description: 'Read a learning journal. Authors have a separate studio.' },
    { name: 'Lost in the park', tag: '07 / PHOTO TAGGING', path: '/hunt/', description: 'Find three friends in an original busy park illustration.' },
    { name: 'Messaging', tag: '08 / PRIVATE CONVERSATIONS', path: '/messages/', description: 'Exchange messages and customize your profile.' },
    { name: 'Odin-Book', tag: '09 / A SOCIAL CIRCLE', path: '/book/', description: 'Follow people, share posts and join conversations.' },
    { name: 'Express practice', tag: 'PRACTICE / ROUTES + FORMS', path: '/practice/', description: 'Routing, validation, user forms and SQL search.' }
  ] }));
  app.use(context, (req, res) => res.status(404).render(view('views/error'), { title: 'Page not found', message: 'This address does not match a project page.' }));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    console.error(error.message);
    res.status(500).render(view('views/error'), { base: '', errors: [], user: null, title: 'Something went wrong', message: 'Please try again in a moment.' });
  });
  return app;
}
