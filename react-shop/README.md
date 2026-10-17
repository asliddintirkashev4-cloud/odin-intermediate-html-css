# Commonplace — Shopping Cart

Three React Router pages: home, shop and bag. Products are fetched from FakeStore API. Each card supports manual quantities and increment/decrement controls. The bag badge counts individual items, duplicate additions merge into one line, and cart quantities, removal and totals update immediately.

Context and a reducer own cart state above the routes. Prices are normalized to integer cents. A shared catalog request avoids duplicate Strict Mode requests. Loading, error/retry, search-empty and cart-empty states are visible. The app has no checkout or payment integration.

Run `npm ci`, `npm run dev` and visit `/app.html`. `npm test` runs React Testing Library user-flow tests through the real components and provider. Tests use a controlled external catalog loader and exercise additions, editing, totals, removal, repeated products, filtering and retry behavior. They do not test router internals.

`npm run build` creates the production files. Publish `dist/app.html` as `index.html` beside the built JS and stylesheet. Relative asset paths and HashRouter allow all three routes to reload correctly on GitHub Pages.
