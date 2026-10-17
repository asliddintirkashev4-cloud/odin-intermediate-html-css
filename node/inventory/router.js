import { Router } from 'express';
import { body, validationResult, matchedData } from 'express-validator';
import { createHash, timingSafeEqual } from 'node:crypto';
import { inventoryModel } from './model.js';
import { context, view } from '../lib/views.js';
const validId = value => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 2147483647;
const digest = value => createHash('sha256').update(String(value || '')).digest();

export function inventoryRouter(db, adminPasscode) {
  const router = Router();
  const model = inventoryModel(db);
  router.use(context);
  router.param('id', (req, res, next, id) => validId(id) ? next() : res.status(404).render(view('views/error'), { title: 'Not found', message: 'That record does not exist.' }));
  router.get('/', async (req, res) => res.render(view('inventory/index'), { title: 'Paper & ink inventory', categories: await model.categories(), items: await model.items() }));
  const guard = (req, res, next) => {
    if (!adminPasscode || !timingSafeEqual(digest(adminPasscode), digest(req.body?.passcode))) return res.status(403).render(view('views/error'), { title: 'Admin passcode required', message: 'The passcode was not accepted. Return to the form and try again.' });
    next();
  };
  for (const kind of ['categories', 'items']) {
    const isItem = kind === 'items';
    const noun = isItem ? 'item' : 'category';
    const renderForm = async (req, res, id = null, errors = [], values = null, status = 200) => {
      const record = id ? await model[isItem ? 'item' : 'category'](id) : {};
      if (!record) return res.status(404).render(view('views/error'), { title: 'Not found', message: 'That record does not exist.' });
      res.status(status).render(view('inventory/form'), { title: (id ? 'Edit ' : 'New ') + noun, kind, isItem, id, categories: await model.categories(), errors, values: values || { ...record, categoryId: record.category_id, price: record.price_cents === undefined ? '' : (record.price_cents / 100).toFixed(2) } });
    };
    router.get('/' + kind + '/new', (req, res) => renderForm(req, res));
    router.get('/' + kind + '/:id/edit', (req, res) => renderForm(req, res, req.params.id));
    router.get('/' + kind + '/:id', async (req, res) => {
      const record = await model[isItem ? 'item' : 'category'](req.params.id);
      if (!record) return res.status(404).render(view('views/error'), { title: 'Not found', message: 'That record does not exist.' });
      res.render(view('inventory/detail'), { title: record.name, record, kind, isItem, items: isItem ? [] : await model.items(record.id) });
    });
    const validations = [
      body('name').trim().isLength({ min: 1, max: isItem ? 120 : 80 }).withMessage('A name within the allowed length is required.'),
      body('description').trim().isLength({ max: isItem ? 2000 : 500 }).withMessage('Description is too long.')
    ];
    if (isItem) validations.push(
      body('categoryId').isInt({ min: 1, max: 2147483647 }).bail().custom(async value => { if (!await model.category(value)) throw new Error('Choose an existing category.'); }),
      body('price').matches(/^\d{1,7}(\.\d{1,2})?$/).withMessage('Price must be a non-negative amount with up to two decimal places.'),
      body('stock').isInt({ min: 0, max: 2147483647 }).withMessage('Stock must be a non-negative whole number.').toInt()
    );
    for (const path of ['/' + kind, '/' + kind + '/:id']) router.post(path, guard, validations, async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return renderForm(req, res, req.params.id, errors.array(), req.body, 400);
      try {
        const record = await model[isItem ? 'saveItem' : 'saveCategory'](req.params.id, matchedData(req));
        if (!record) return res.status(404).render(view('views/error'), { title: 'Not found', message: 'That record no longer exists.' });
        res.redirect(303, res.locals.base + '/' + kind + '/' + record.id);
      } catch (error) {
        if (error.code === '23505') return renderForm(req, res, req.params.id, ['A category with that name already exists.'], req.body, 409);
        throw error;
      }
    });
    router.post('/' + kind + '/:id/delete', guard, async (req, res) => {
      try {
        const result = await model[isItem ? 'deleteItem' : 'deleteCategory'](req.params.id);
        if (!result.rowCount) return res.status(404).render(view('views/error'), { title: 'Not found', message: 'That record no longer exists.' });
        res.redirect(303, res.locals.base + '/');
      } catch (error) {
        if (error.code === '23503') return res.status(409).render(view('views/error'), { title: 'Category is still in use', message: 'Move or remove the items in this category before deleting it.' });
        throw error;
      }
    });
  }
  return router;
}
