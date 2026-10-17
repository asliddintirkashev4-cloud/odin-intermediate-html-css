# Open Water — Battleship

Play against a computer with two 10×10 boards. Shuffle the fleet before starting, fire at untried enemy coordinates, and sink all five ships. The computer chooses only legal, untried squares. A completed game locks both boards until a new game starts.

`model.js` contains Ship, Gameboard, Player, random fleet placement and the game controller. `app.js` renders the boards and connects controls. Rules do not depend on the DOM.

Serve this directory with a static web server to play. Run `npm ci && npm test` for the Jest/Babel model tests. They cover ship damage, horizontal/vertical placement, overlaps, bounds, misses, duplicate attacks, fleet layout, player ownership, legal computer targeting, alternating turns and both winning outcomes.
