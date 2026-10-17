import { Router } from 'express';
import { body, matchedData, validationResult } from 'express-validator';
import { rateLimit } from 'express-rate-limit';
const targets = [
  { id: 'milo', name: 'Milo', clue: 'Red striped shirt and a red beanie', x: [0.21, 0.25], y: [0.34, 0.43] },
  { id: 'ada', name: 'Ada', clue: 'Blue umbrella and a purple coat', x: [0.655, 0.705], y: [0.625, 0.725] },
  { id: 'pip', name: 'Pip', clue: 'A little yellow robot', x: [0.80, 0.84], y: [0.25, 0.335] }
];
const validId = id => /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
export function huntApi(prisma) {
  const router = Router();
  router.post('/games', rateLimit({ windowMs: 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }), async (req, res) => {
    const game = await prisma.hunt.create({ data: { startedAt: new Date() } });
    res.status(201).json({ id: game.id, startedAt: game.startedAt, targets: targets.map(({ id, name, clue }) => ({ id, name, clue })) });
  });
  router.get('/scores', async (req, res) => res.json({ scores: await prisma.hunt.findMany({ where: { playerName: { not: null }, completedAt: { not: null }, elapsedMs: { not: null } }, select: { playerName: true, elapsedMs: true }, orderBy: { elapsedMs: 'asc' }, take: 10 }) }));
  router.param('id', (req, res, next, id) => validId(id) ? next() : res.sendStatus(404));
  router.post('/games/:id/guess', [body('x').isFloat({ min: 0, max: 1 }).toFloat(), body('y').isFloat({ min: 0, max: 1 }).toFloat(), body('target').isIn(targets.map(t => t.id))], async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Choose a character and a point inside the scene.' });
    const { x, y, target: targetId } = matchedData(req);
    const result = await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT id FROM "Hunt" WHERE id=${req.params.id} FOR UPDATE`;
      const game = await tx.hunt.findUnique({ where: { id: req.params.id } });
      if (!game) return { status: 404, body: { error: 'Game not found.' } };
      if (Date.now() - game.startedAt.getTime() > 7200000) return { status: 410, body: { error: 'This game expired. Start a new search.' } };
      if (game.found.includes(targetId)) return { status: 200, body: { correct: true, alreadyFound: true, found: game.found, complete: Boolean(game.completedAt), elapsedMs: game.elapsedMs } };
      const target = targets.find(t => t.id === targetId);
      const correct = x >= target.x[0] && x <= target.x[1] && y >= target.y[0] && y <= target.y[1];
      if (!correct) return { status: 200, body: { correct: false, found: game.found, complete: false } };
      const found = [...game.found, targetId];
      const complete = found.length === targets.length;
      const now = new Date();
      const elapsedMs = complete ? Math.max(0, now.getTime() - game.startedAt.getTime()) : null;
      await tx.hunt.update({ where: { id: game.id }, data: { found, ...(complete ? { completedAt: now, elapsedMs } : {}) } });
      return { status: 200, body: { correct: true, found, complete, elapsedMs } };
    });
    res.status(result.status).json(result.body);
  });
  router.post('/games/:id/score', body('name').trim().isLength({ min: 1, max: 80 }), async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).json({ error: 'Use a name of 1–80 characters.' });
    const result = await prisma.hunt.updateMany({ where: { id: req.params.id, completedAt: { not: null }, playerName: null }, data: { playerName: matchedData(req).name } });
    if (!result.count) return res.status(409).json({ error: 'Finish the search first, or start a new game if your score was already saved.' });
    res.status(201).json({ saved: true });
  });
  router.use((req, res) => res.status(404).json({ error: 'Game route not found.' }));
  return router;
}
