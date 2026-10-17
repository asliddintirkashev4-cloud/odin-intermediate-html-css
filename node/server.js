import { createApp } from './app.js';
import { pool } from './lib/db.js';
import { createPrisma } from './lib/prisma.js';
const prisma = createPrisma(process.env.DATABASE_URL);
const app = createApp(pool, { prisma });
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const server = app.listen(Number(process.env.PORT || 8080), process.env.HOST || '0.0.0.0', () => console.log('Server workshop is ready.'));
async function stop() { server.close(async () => { for (const store of app.locals.sessionStores) { await store.shutdown?.(); store.close?.(); } await pool.end(); await prisma.$disconnect(); process.exit(0); }); }
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
