import express from 'express';
import { fileURLToPath } from 'node:url';

export function informationalRouter() {
  const router = express.Router();
  for (const [path, file] of [['/', 'index.html'], ['/about', 'about.html'], ['/contact-me', 'contact-me.html']]) {
    router.get(path, (req, res) => res.sendFile(fileURLToPath(new URL(file, import.meta.url))));
  }
  router.use((req, res) => res.status(404).sendFile(fileURLToPath(new URL('404.html', import.meta.url))));
  return router;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  express().use(informationalRouter()).listen(Number(process.env.PORT || 8080), process.env.HOST || '127.0.0.1');
}
