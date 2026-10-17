const scene = document.querySelector('#scene');
const picture = document.querySelector('#picture');
const menu = document.querySelector('#menu');
const aim = document.querySelector('#aim');
const status = document.querySelector('#status');
const form = document.querySelector('#score-form');
let game, timer, starting = false, point = { x: .5, y: .5 }, found = [];
function node(tag, text) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; return e; }
async function api(path, body) {
  const response = await fetch('api' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Request failed.'); return data;
}
function action(fn) { return async event => { event?.preventDefault(); try { await fn(event); } catch (error) { status.textContent = error.message; } }; }
async function scores() {
  const { scores } = await api('/scores'); const rows = document.querySelector('#scores'); rows.replaceChildren();
  for (const score of scores) { const row = node('tr'); row.append(node('td', score.playerName), node('td', (score.elapsedMs / 1000).toFixed(1) + ' s')); rows.append(row); }
  if (!scores.length) { const row = node('tr'); const cell = node('td', 'No scores yet. Make the first find.'); cell.colSpan = 2; row.append(cell); rows.append(row); }
}
async function start() {
  if (starting) return;
  starting = true; document.querySelector('#restart').disabled = true;
  clearInterval(timer); menu.hidden = true; aim.hidden = true; form.hidden = true; form.reset(); form.querySelector('button').disabled = false;
  found = []; document.querySelector('#markers').replaceChildren();
  try {
    game = await api('/games', {}); const startTime = performance.now();
    document.querySelector('#progress').textContent = '0 / 3 found'; document.querySelector('#timer').textContent = '0.0 s';
    const characters = document.querySelector('#characters'); characters.replaceChildren();
    for (const target of game.targets) { const item = node('li', target.name + ' — ' + target.clue); item.dataset.target = target.id; characters.append(item); }
    timer = setInterval(() => { document.querySelector('#timer').textContent = ((performance.now() - startTime) / 1000).toFixed(1) + ' s'; }, 100);
    status.textContent = 'Your search has started.';
  } finally { starting = false; document.querySelector('#restart').disabled = false; }
}
async function guess(id) {
  menu.hidden = true; aim.hidden = true;
  const result = await api('/games/' + game.id + '/guess', { ...point, target: id });
  if (!result.correct) { status.textContent = 'Not quite. Look for that character somewhere else.'; picture.focus(); return; }
  found = result.found;
  if (!result.alreadyFound) { const marker = node('span', '✓'); marker.className = 'marker'; marker.style.left = point.x * 100 + '%'; marker.style.top = point.y * 100 + '%'; marker.title = game.targets.find(t => t.id === id).name; document.querySelector('#markers').append(marker); }
  for (const item of document.querySelectorAll('[data-target]')) { const done = found.includes(item.dataset.target); item.classList.toggle('found', done); if (done && !item.textContent.startsWith('✓ ')) item.prepend('✓ '); }
  document.querySelector('#progress').textContent = found.length + ' / 3 found';
  status.textContent = 'Found ' + game.targets.find(t => t.id === id).name + '!';
  if (result.complete) { clearInterval(timer); document.querySelector('#timer').textContent = (result.elapsedMs / 1000).toFixed(1) + ' s'; form.hidden = false; status.textContent = 'Everyone found! Your time was recorded by the server.'; form.elements.name.focus(); }
  else picture.focus();
}
function choose() {
  if (!game || found.length === 3 || starting) return;
  aim.style.left = point.x * 100 + '%'; aim.style.top = point.y * 100 + '%'; aim.hidden = false;
  menu.replaceChildren();
  for (const target of game.targets.filter(t => !found.includes(t.id))) { const button = node('button', target.name); button.type = 'button'; button.addEventListener('click', action(() => guess(target.id))); menu.append(button); }
  menu.style.left = Math.min(75, point.x * 100) + '%'; menu.style.top = Math.min(75, point.y * 100) + '%'; menu.hidden = false; menu.querySelector('button')?.focus();
}
picture.addEventListener('click', event => { const rect = picture.getBoundingClientRect(); point = { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) }; choose(); });
picture.addEventListener('keydown', event => {
  if (event.key.startsWith('Arrow')) { event.preventDefault(); const delta = event.shiftKey ? .005 : .02; point.x = Math.max(0, Math.min(1, point.x + (event.key === 'ArrowRight' ? delta : event.key === 'ArrowLeft' ? -delta : 0))); point.y = Math.max(0, Math.min(1, point.y + (event.key === 'ArrowDown' ? delta : event.key === 'ArrowUp' ? -delta : 0))); aim.style.left = point.x * 100 + '%'; aim.style.top = point.y * 100 + '%'; aim.hidden = false; }
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') { menu.hidden = true; aim.hidden = true; picture.focus(); } });
document.addEventListener('click', event => { if (!scene.contains(event.target)) { menu.hidden = true; aim.hidden = true; } });
document.querySelector('#restart').addEventListener('click', action(start));
form.addEventListener('submit', action(async () => { await api('/games/' + game.id + '/score', { name: form.elements.name.value }); form.querySelector('button').disabled = true; status.textContent = 'Your score is saved.'; await scores(); }));
action(async () => { await start(); await scores(); })();
