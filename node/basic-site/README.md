# Basic Informational Site

Four HTML pages served by a native Node HTTP server. The Express rewrite is included in `express.js`.

Run `npm start` for the native server at `http://localhost:8080`.
For the Express version, run `npm install` and `npm run start:express`.

Routes: `/`, `/about`, `/contact-me`. Other routes return the custom page with status 404. Query parameters do not change route matching. Only GET and HEAD are accepted by the native server.

The parent project's integration tests cover both implementations.
