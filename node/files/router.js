import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { body, matchedData, validationResult } from 'express-validator';
import { authArea, requireUser, csrfGuard } from '../lib/auth.js';
import { view } from '../lib/views.js';
import { inspectFile, saveBytes, loadBytes, removeLocalBytes } from './storage.js';
const metadata = { id: true, name: true, mime: true, size: true, createdAt: true, folderId: true, url: true };
const validId = value => /^\d+$/.test(String(value)) && Number(value) > 0 && Number(value) <= 2147483647;
export function filesArea(options) {
  const { prisma } = options;
  const area = authArea({ ...options, name: 'files', prismaStore: true });
  const router = area.router;
  const storageMode = options.fileStorage || process.env.FILE_STORAGE || 'database';
  const uploader = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 4, fieldSize: 1024 } }).single('file');
  router.use(requireUser);
  const ownedFolder = (req, id) => validId(id) ? prisma.folder.findFirst({ where: { id: Number(id), ownerId: req.user.id } }) : null;
  router.get('/', async (req, res) => res.render(view('files/index'), { title: 'Your file shelf', folders: await prisma.folder.findMany({ where: { ownerId: req.user.id }, include: { _count: { select: { files: true } } }, orderBy: { name: 'asc' } }) }));
  router.post('/folders', body('name').trim().isLength({ min: 1, max: 120 }), async (req, res) => {
    if (!validationResult(req).isEmpty()) return res.status(400).render(view('views/error'), { title: 'Folder name needed', message: 'Use 1–120 characters.' });
    try { await prisma.folder.create({ data: { name: matchedData(req).name, ownerId: req.user.id } }); }
    catch (error) { if (error.code === 'P2002') return res.status(409).render(view('views/error'), { title: 'Folder already exists', message: 'Choose another folder name.' }); throw error; }
    res.redirect(303, res.locals.base + '/');
  });
  router.get('/folders/:id', async (req, res) => {
    const folder = await ownedFolder(req, req.params.id);
    if (!folder) return res.sendStatus(404);
    const files = await prisma.storedFile.findMany({ where: { folderId: folder.id, ownerId: req.user.id }, select: metadata, orderBy: { createdAt: 'desc' } });
    res.render(view('files/folder'), { title: folder.name, folder, files });
  });
  router.post('/folders/:id/rename', body('name').trim().isLength({ min: 1, max: 120 }), async (req, res) => {
    const folder = await ownedFolder(req, req.params.id);
    if (!folder) return res.sendStatus(404);
    if (!validationResult(req).isEmpty()) return res.status(400).send('Use a folder name of 1–120 characters.');
    try { await prisma.folder.update({ where: { id: folder.id }, data: { name: matchedData(req).name } }); }
    catch (error) { if (error.code === 'P2002') return res.status(409).send('Folder name already exists.'); throw error; }
    res.redirect(303, res.locals.base + '/folders/' + folder.id);
  });
  router.post('/folders/:id/delete', async (req, res) => {
    const folder = await ownedFolder(req, req.params.id);
    if (!folder) return res.sendStatus(404);
    try { await prisma.folder.delete({ where: { id: folder.id } }); }
    catch (error) { if (error.code === 'P2003') return res.status(409).render(view('views/error'), { title: 'Folder is not empty', message: 'Remove the files before deleting this folder.' }); throw error; }
    res.redirect(303, res.locals.base + '/');
  });
  router.post('/upload', (req, res, next) => uploader(req, res, error => {
    if (error) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).render(view('views/error'), { title: 'Upload was not accepted', message: 'Choose one supported file, no larger than 5 MB.' });
    next();
  }), csrfGuard, async (req, res) => {
    const folder = await ownedFolder(req, req.body.folderId);
    if (!folder) return res.sendStatus(404);
    if (!req.file) return res.status(400).send('Choose a file to upload.');
    let checked;
    try { checked = inspectFile(req.file.buffer, req.file.originalname); }
    catch (error) { return res.status(400).render(view('views/error'), { title: 'Unsupported file', message: error.message }); }
    const id = randomUUID();
    const data = await saveBytes(id, req.file.buffer, storageMode);
    try { await prisma.storedFile.create({ data: { id, ...checked, size: req.file.size, ownerId: req.user.id, folderId: folder.id, storageKey: id, data, url: res.locals.base + '/items/' + id + '/download' } }); }
    catch (error) { if (storageMode === 'local') await removeLocalBytes(id); throw error; }
    res.redirect(303, res.locals.base + '/folders/' + folder.id);
  });
  router.get('/items/:id', async (req, res) => {
    const file = await prisma.storedFile.findFirst({ where: { id: req.params.id, ownerId: req.user.id }, select: metadata });
    if (!file) return res.sendStatus(404);
    res.render(view('files/detail'), { title: file.name, file });
  });
  router.get('/items/:id/download', async (req, res) => {
    const file = await prisma.storedFile.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!file) return res.sendStatus(404);
    res.attachment(file.name).type(file.mime).set('X-Content-Type-Options', 'nosniff').send(await loadBytes(file));
  });
  router.post('/items/:id/delete', async (req, res) => {
    const file = await prisma.storedFile.findFirst({ where: { id: req.params.id, ownerId: req.user.id } });
    if (!file) return res.sendStatus(404);
    await prisma.storedFile.delete({ where: { id: file.id } });
    if (!file.data) await removeLocalBytes(file.storageKey);
    res.redirect(303, res.locals.base + '/folders/' + file.folderId);
  });
  return area;
}
