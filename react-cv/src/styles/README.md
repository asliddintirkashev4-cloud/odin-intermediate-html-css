# Papertrail — CV Application

React components for general information, education and practical experience. Controlled inputs feed a live preview. Saving hides the inputs and shows the CV as HTML; Edit restores the form with the same values. The app rejects an experience end date before its start date.

The initial profile is fictional sample content. Data stays in memory until the page is closed or refreshed.

Run `npm ci`, then `npm run dev` and visit `/app.html`. `npm run build` creates `dist/app.html`, `bundle.js` and CSS. For GitHub Pages, publish the built HTML as `index.html` alongside the bundled assets in `react-cv/`. The unbuilt template remains `app.html` in the source directory. Relative asset paths allow the built app to run in a Pages subdirectory.
