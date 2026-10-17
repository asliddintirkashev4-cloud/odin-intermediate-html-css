import {createGame} from './tictactoe-model.mjs';

const displayController = (() => {
  const form = document.querySelector('#players');
  const board = document.querySelector('#board');
  const status = document.querySelector('#game-status');
  let game = createGame();
  function render() {
    const state = game.snapshot();
    for (const cell of board.children) {
      const index = Number(cell.dataset.cell);
      const mark = state.board[index];
      cell.textContent = mark;
      cell.dataset.mark = mark;
      cell.disabled = Boolean(mark || state.result);
      cell.classList.toggle('winner', state.result?.line?.includes(index) ?? false);
      cell.setAttribute('aria-label', `Row ${Math.floor(index / 3) + 1} column ${index % 3 + 1}, ${mark || 'empty'}`);
    }
    status.textContent = state.result?.type === 'win' ? `${state.result.winner.name} wins!` : state.result?.type === 'draw' ? 'A draw. A good reason for another round.' : `${state.current.name}’s turn (${state.current.mark})`;
  }
  function start(event) {
    event?.preventDefault();
    game = createGame(form.elements.player_x.value, form.elements.player_o.value);
    render();
  }
  board.addEventListener('click', event => {
    const button = event.target.closest('[data-cell]');
    if (button && game.play(Number(button.dataset.cell))) render();
  });
  form.addEventListener('submit', start);
  document.querySelector('#restart').addEventListener('click', start);
  render();
  return {start};
})();
