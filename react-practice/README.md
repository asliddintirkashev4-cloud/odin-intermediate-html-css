# React practice

Three routed exercise pages:
- Basics: Hello World and named exports, props, JSX expressions, conditional lists and stable keys, a background-color change counter, live first/last-name state, nested context consumers and input focus through a ref.
- Class tasks: a class-based task list with add, delete, edit/resubmit and a separate class-based Count component.
- Reducers: recipient selection and typing dispatch actions, sending clears the selected draft, switching recipients restores independent drafts, and a custom reducer hook is implemented from useState with functional updates.

The reducer page follows the four challenges in React’s “Extracting State Logic into a Reducer”. Contacts and messages are fictional examples; the demo has no messaging backend.

Run `npm ci`, `npm run dev` and visit `/app.html`. `npm test` runs three React Testing Library flows. Build with `npm run build` and publish the built HTML as `index.html` alongside its JS and CSS. Hash-based routes work on GitHub Pages.
