# Casa Lento — Restaurant Page

A fictional restaurant with Home, Menu and Contact views. Header navigation stays in the HTML template; every page body is created in JavaScript by a separate ES module. The entry module clears the content container before rendering the selected view.

## Run
- `npm ci`
- `npm run dev` — Webpack development server at http://127.0.0.1:8080/
- `npm run build` — production output in `dist/`

## Structure
- `src/template.html`: header, navigation buttons and empty content container.
- `src/index.js`: tab navigation and initial render.
- `src/home.js`, `src/menu.js`, `src/contact.js`: view modules.
- `src/dom.js`: shared DOM helpers and footer.
- `src/style.css`, `src/plate.svg`: original styling and illustration.

## Deployment in the coursework collection
The production `dist/index.html` is published as `restaurant.html` alongside `restaurant.bundle.js` in the parent collection. Keeping the output at the collection root preserves relative asset URLs and the other projects. The source folder retains its normal standalone Webpack structure.

## Validation
Webpack production build passes. The three navigation buttons and the home-page menu button render their respective views; returning home removes the previous view.
