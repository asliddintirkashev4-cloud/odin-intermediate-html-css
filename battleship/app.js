import {Player, Game, createFleet} from './model.js';
const status = document.querySelector('#status');
const shuffle = document.querySelector('#shuffle');
const start = document.querySelector('#start');
let game;
function reset() {
  const human = new Player(); human.board = createFleet();
  const computer = new Player('computer'); computer.board = createFleet();
  game = new Game(human, computer);
  status.textContent = 'Arrange your fleet, then start the game.';
  render();
}
function renderBoard(element, board, opponent = false) {
  const focused = element.contains(document.activeElement) ? document.activeElement.dataset.coordinate : null;
  element.replaceChildren();
  for (let y = 0; y < 10; y += 1) for (let x = 0; x < 10; x += 1) {
    const coordinate = [x,y];
    const shot = board.attacks.get(coordinate.join(','));
    const ship = board.shipAt(coordinate);
    const visible = ship && (!opponent || game.phase === 'over' || shot?.hit);
    const cell = document.createElement('button');
    cell.type = 'button'; cell.className = 'square';
    cell.dataset.coordinate = coordinate.join(',');
    if (visible) cell.classList.add('ship');
    if (shot) { cell.classList.add(shot.hit ? 'hit' : 'miss'); cell.textContent = shot.hit ? '×' : '·'; }
    if (visible && ship.isSunk()) cell.classList.add('sunk');
    const state = shot ? (shot.hit ? (ship.isSunk() ? 'sunk ship' : 'hit') : 'miss') : visible ? 'ship' : 'untried';
    cell.setAttribute('aria-label', `${opponent ? 'Attack' : 'Your'} ${String.fromCharCode(65+x)}${y+1}: ${state}`);
    cell.disabled = !opponent || game.phase !== 'playing' || Boolean(shot);
    if (opponent) cell.addEventListener('click', () => fire(coordinate));
    element.append(cell);
  }
  if (focused) element.querySelector(`[data-coordinate="${focused}"]`)?.focus();
}
function render() {
  renderBoard(document.querySelector('#your-board'), game.human.board);
  renderBoard(document.querySelector('#enemy-board'), game.computer.board, true);
  for (const [selector, board] of [['#your-count',game.human.board],['#enemy-count',game.computer.board]]) {
    document.querySelector(selector).textContent = `${board.ships.filter(ship => !ship.isSunk()).length} ships afloat`;
  }
  shuffle.hidden = game.phase !== 'setup'; start.hidden = game.phase !== 'setup';
}
function fire(coordinate) {
  const result = game.fire(coordinate);
  if (!result.legal) return;
  if (game.phase === 'over') status.textContent = game.winner === 'human' ? 'A clear horizon. You sank the enemy fleet — you win!' : 'Your fleet has gone under. The computer wins. Try a new game.';
  else {
    const yourShot = result.human.sunk ? 'You sank a ship!' : result.human.hit ? 'Your shot hit a ship.' : 'Your shot missed.';
    const response = result.computer.sunk ? 'The computer sank one of yours.' : result.computer.hit ? 'The computer hit your fleet.' : 'The computer missed.';
    status.textContent = `${yourShot} ${response} Your turn.`;
  }
  render();
}
shuffle.addEventListener('click', () => { if (game.phase === 'setup') { game.human.board = createFleet(); status.textContent = 'New formation ready. Start when you are.'; render(); } });
start.addEventListener('click', () => { if (game.start()) { status.textContent = 'Your turn. Choose a square in uncharted waters.'; render(); } });
document.querySelector('#restart').addEventListener('click', reset);
reset();
