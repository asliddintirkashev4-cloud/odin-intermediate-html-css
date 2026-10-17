# Pocket Recall — Memory Card

Twelve cards are fetched from PokéAPI, including names and sprite images. Cards shuffle on load and after every selection. A repeated card ends the round; selecting every card wins. The current score and best score are separate, and the best score persists locally.

API resources are cached locally for seven days. In-flight requests are shared so Strict Mode does not duplicate the entire fetch sequence. Failed requests show an error and retry control. No API key is needed.

Run `npm ci` and `npm run dev`, then open `/app.html`. Build with `npm run build`. Publish `dist/app.html` as `index.html`, with `bundle.js` and the built stylesheet alongside it. Relative asset paths work under GitHub Pages subdirectories. Pokémon imagery and names are supplied by PokéAPI and belong to their respective owners.
