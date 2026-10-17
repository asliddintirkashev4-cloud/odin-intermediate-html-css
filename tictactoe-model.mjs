const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function createGameboard() {
  const cells = Array(9).fill('');
  return {
    place(index, mark) {
      if (!Number.isInteger(index) || index < 0 || index > 8 || cells[index]) return false;
      cells[index] = mark;
      return true;
    },
    snapshot: () => [...cells],
  };
}

export function createPlayer(name, mark) {
  return Object.freeze({name: String(name).trim() || `Player ${mark}`, mark});
}

export function createGame(firstName = 'Player X', secondName = 'Player O') {
  const players = [createPlayer(firstName, 'X'), createPlayer(secondName, 'O')];
  const board = createGameboard();
  let turn = 0;
  let result = null;
  function play(index) {
    if (result || !board.place(index, players[turn].mark)) return false;
    const cells = board.snapshot();
    const line = winningLines.find(line => line.every(position => cells[position] === players[turn].mark));
    if (line) result = {type: 'win', winner: players[turn], line};
    else if (cells.every(Boolean)) result = {type: 'draw'};
    else turn = 1 - turn;
    return true;
  }
  function snapshot() {
    return {board: board.snapshot(), players: [...players], current: players[turn], result: result ? {...result, ...(result.line ? {line: [...result.line]} : {})} : null};
  }
  return {play, snapshot};
}
