import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame} from './tictactoe-model.mjs';

for (const line of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]) {
  test(`detects winning line ${line}`, () => {
    const game = createGame('First', 'Second');
    const other = Array.from({length:9}, (_, i) => i).filter(i => !line.includes(i));
    for (const move of [line[0], other[0], line[1], other[1], line[2]]) assert.equal(game.play(move), true);
    assert.equal(game.snapshot().result.winner.mark, 'X');
    assert.deepEqual(game.snapshot().result.line, line);
    assert.equal(game.play(other[2]), false);
  });
}
test('an occupied or invalid square does not consume the next turn', () => {
  const game = createGame();
  game.play(0);
  for (const index of [0, -1, 9, 1.5]) assert.equal(game.play(index), false);
  assert.equal(game.snapshot().current.mark, 'O');
});
test('a full board without a winning line is a draw', () => {
  const game = createGame();
  for (const index of [0,1,2,4,3,5,7,6,8]) game.play(index);
  assert.equal(game.snapshot().result.type, 'draw');
});
test('snapshots and separate games cannot overwrite a game board', () => {
  const game = createGame();
  game.snapshot().board[0] = 'O';
  assert.equal(game.snapshot().board[0], '');
  const another = createGame();
  another.play(0);
  assert.equal(game.snapshot().board[0], '');
});

test('the second player can win with their own name and mark', () => {
  const game = createGame('First', 'Second');
  for (const index of [0,3,1,4,8,5]) game.play(index);
  assert.equal(game.snapshot().result.winner.mark, 'O');
  assert.equal(game.snapshot().result.winner.name, 'Second');
});
