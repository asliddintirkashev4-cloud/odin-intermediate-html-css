import {Ship, Gameboard, Player, createFleet, Game} from './model.js';
test('a ship counts hits and sinks only at its length', () => {
  const ship = new Ship(2);
  expect(ship.isSunk()).toBe(false);
  ship.hit(); expect(ship.hits).toBe(1); expect(ship.isSunk()).toBe(false);
  ship.hit(); expect(ship.isSunk()).toBe(true);
});

test('gameboard places ships horizontally and vertically and rejects overlap or off-board placement', () => {
 const board = new Gameboard();
 expect(board.placeShip(3,[0,0])).toBe(true);
 expect(board.placeShip(2,[2,2],'vertical')).toBe(true);
 expect(board.shipAt([2,0]).length).toBe(3);
 expect(board.shipAt([2,3]).length).toBe(2);
 expect(board.placeShip(2,[2,0])).toBe(false);
 expect(board.placeShip(3,[9,9])).toBe(false);
 expect(board.ships.length).toBe(2);
});

test('attacks record hits and misses, reject repeated shots, and report a sunk fleet', () => {
 const board = new Gameboard(); board.placeShip(2,[0,0]);
 expect(board.allSunk()).toBe(false);
 expect(board.receiveAttack([0,0])).toEqual({legal:true,hit:true,sunk:false});
 expect(board.receiveAttack([0,0])).toEqual({legal:false});
 expect(board.shipAt([0,0]).hits).toBe(1);
 expect(board.receiveAttack([9,9])).toEqual({legal:true,hit:false,sunk:false});
 expect(board.missedAttacks).toEqual([[9,9]]);
 expect(board.receiveAttack([1,0])).toEqual({legal:true,hit:true,sunk:true});
 expect(board.allSunk()).toBe(true);
 expect(board.receiveAttack([-1,0])).toEqual({legal:false});
});

test('players own separate boards and the computer chooses only untried squares', () => {
 const human = new Player('real'); const computer = new Player('computer');
 expect(human.board).not.toBe(computer.board);
 const seen = new Set();
 for (let index=0; index<100; index+=1) {
  const square = computer.chooseAttack(human.board, () => 0);
  expect(seen.has(square.join(','))).toBe(false);
  seen.add(square.join(',')); human.board.receiveAttack(square);
 }
 expect(seen.size).toBe(100);
 expect(computer.chooseAttack(human.board)).toBe(undefined);
});

test('fleet generation creates the five standard ships without overlap', () => {
 const board = createFleet(() => 0);
 expect(board.ships.map(ship => ship.length)).toEqual([5,4,3,3,2]);
 expect(board.occupied.size).toBe(17);
 expect(board.allSunk()).toBe(false);
});

test('game waits for start, alternates legal turns and ignores a repeated attack', () => {
 const human = new Player(); const computer = new Player('computer');
 human.board.placeShip(2,[0,0]); computer.board.placeShip(2,[0,0]);
 const game = new Game(human,computer,() => 0);
 expect(game.fire([9,9]).legal).toBe(false);
 game.start();
 const result = game.fire([9,9]);
 expect(result.human.hit).toBe(false); expect(result.computer.hit).toBe(true);
 expect(human.board.attacks.size).toBe(1); expect(computer.board.attacks.size).toBe(1);
 expect(game.fire([9,9]).legal).toBe(false); expect(human.board.attacks.size).toBe(1);
 expect(game.phase).toBe('playing');
});

test('a winning attack ends play before a computer response and locks the finished game', () => {
 const human = new Player(); const computer = new Player('computer');
 human.board.placeShip(1,[0,0]); computer.board.placeShip(1,[0,0]);
 const game = new Game(human,computer,() => 0); game.start();
 expect(game.fire([0,0]).human.sunk).toBe(true);
 expect(game.winner).toBe('human'); expect(game.phase).toBe('over');
 expect(human.board.attacks.size).toBe(0); expect(game.fire([1,1]).legal).toBe(false);
});
test('the computer can win and the game stops immediately', () => {
 const human = new Player(); const computer = new Player('computer');
 human.board.placeShip(1,[0,0]); computer.board.placeShip(1,[0,0]);
 const game = new Game(human,computer,() => 0); game.start(); game.fire([9,9]);
 expect(game.winner).toBe('computer'); expect(game.phase).toBe('over');
 expect(game.fire([0,0]).legal).toBe(false);
});
