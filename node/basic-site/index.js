import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const pages = new Map([['/', 'index.html'], ['/about', 'about.html'], ['/contact-me', 'contact-me.html']]);
export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (!['GET', 'HEAD'].includes(req.method)) {
        res.writeHead(405, { Allow: 'GET, HEAD' });
        return res.end('Method not allowed');
      }
      const body = await readFile(new URL(pages.get(path) || '404.html', import.meta.url));
      res.writeHead(pages.has(path) ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Unable to load page');
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createServer().listen(Number(process.env.PORT || 8080), process.env.HOST || '127.0.0.1');
}
