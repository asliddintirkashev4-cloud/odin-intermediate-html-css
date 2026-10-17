# The Odin Project — Coursework

This repository contains HTML, CSS and JavaScript projects and practice exercises.

## Projects
- `signup.html`: Fern & Field registration form. Semantic labels, required fields, email and length validation, password confirmation, blue focus states and invalid field styling. Local demo only; data is never submitted or stored.
- `dashboard.html`: Fieldwork admin dashboard. Nested CSS Grid layouts for the page, sidebar, header, projects, announcements and community. Search, favorites, preview dialogs and session-only project creation are working enhancements. Fictional profiles and concept cards are sample content.

## Practice
- `svg.html`: original shapes, viewBox scaling, inline SVG and linked SVG examples.
- `planets.html`: MDN planet table challenge, using the historical exercise dataset.

## Run
Open `index.html` or serve this folder with `python3 -m http.server 8765`. No build tools or dependencies required.

## Assets
The forest and leaf SVG illustrations are original artwork created for these exercises. The sign-up wordmark uses Cormorant Garamond via Google Fonts, with Georgia as the offline fallback. No third-party photographs are included.

## Assignment references
- https://www.theodinproject.com/lessons/node-path-intermediate-html-and-css-sign-up-form
- https://www.theodinproject.com/lessons/node-path-intermediate-html-and-css-admin-dashboard
- https://www.theodinproject.com/lessons/node-path-intermediate-html-and-css-svg
- https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Planet_data_table

Browser checks and publication status are tracked separately; this repository does not imply completion of the full Odin curriculum.

## Additional exercises
- `holy-basic.html`, `holy-responsive.html`, `holy-mockup.html`: CSS Grid exercises using The Odin Project starter markup. Starter license: `ODIN-EXERCISES-LICENSE`.
- `selectors-1.html` to `selectors-5.html`: solutions demonstrating MDN selector tasks with equivalent sample text and the required DOM relationships.
- `fonts.html`: the MDN starting page with locally hosted WOFF2 fonts and original CSS additions. Source: https://github.com/mdn/learning-area/tree/main/css/web-fonts . The source sample license is included as `MDN-SAMPLE-LICENSE.txt`; Zantroke’s font license is `ZANTROKE-LICENSE.txt`. Font files are the assets supplied with the MDN exercise.

## JavaScript
- `library.html`: Library project. The array of book objects is separate from rendering. Each book has a UUID; a prototype method toggles its reading status. Books can be added and removed by ID. State lasts for the current page session.
- `library-model.mjs`: book constructor and collection functions.
- Run `node --test library.test.mjs` for model checks.
- `prototype-exercises.mjs`: four prototype-inheritance exercises; run with Node.js.
