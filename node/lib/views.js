import { fileURLToPath } from 'node:url';
export const view = name => fileURLToPath(new URL('../' + name + '.ejs', import.meta.url));
export function context(req, res, next) {
  res.locals.base = req.baseUrl;
  res.locals.user = req.user || null;
  res.locals.errors = [];
  res.locals.values = {};
  next();
}
