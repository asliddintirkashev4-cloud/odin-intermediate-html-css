export class Ship {
  constructor(length) {
    if (!Number.isInteger(length) || length < 1 || length > 10) throw new RangeError('Invalid ship length.');
    this.length = length;
    this.hits = 0;
  }
  hit() { if (!this.isSunk()) this.hits += 1; }
  isSunk() { return this.hits === this.length; }
}

const valid = square => Array.isArray(square) && square.length === 2 && square.every(value => Number.isInteger(value) && value >= 0 && value < 10);
const key = square => square.join(',');
export class Gameboard {
  constructor() { this.ships = []; this.occupied = new Map(); this.attacks = new Map(); this.missedAttacks = []; }
  placeShip(length, start, direction = 'horizontal') {
    if (!Number.isInteger(length) || length < 1 || length > 10 || !valid(start) || !['horizontal','vertical'].includes(direction)) return false;
    const cells = Array.from({length}, (_,i) => [start[0] + (direction === 'horizontal' ? i : 0), start[1] + (direction === 'vertical' ? i : 0)]);
    if (cells.some(square => !valid(square) || this.occupied.has(key(square)))) return false;
    const ship = new Ship(length);
    this.ships.push(ship);
    cells.forEach(square => this.occupied.set(key(square), ship));
    return true;
  }
  shipAt(square) { return this.occupied.get(key(square)); }
  receiveAttack(square) {
    if (!valid(square) || this.attacks.has(key(square))) return {legal:false};
    const ship = this.shipAt(square);
    if (ship) ship.hit();
    else this.missedAttacks.push([...square]);
    const result = {legal:true, hit:Boolean(ship), sunk:Boolean(ship?.isSunk())};
    this.attacks.set(key(square), result);
    return result;
  }
  allSunk() { return this.ships.length > 0 && this.ships.every(ship => ship.isSunk()); }
}

export class Player {
  constructor(type = 'real') { this.type = type; this.board = new Gameboard(); }
  chooseAttack(enemyBoard, random = Math.random) {
    const available = [];
    for (let y=0; y<10; y+=1) for (let x=0; x<10; x+=1) if (!enemyBoard.attacks.has(key([x,y]))) available.push([x,y]);
    return available.length ? available[Math.min(available.length - 1, Math.floor(random() * available.length))] : undefined;
  }
}

export function createFleet(random = Math.random) {
  const board = new Gameboard();
  for (const length of [5,4,3,3,2]) {
    const candidates = [];
    for (const direction of ['horizontal','vertical']) for (let y=0; y<10; y+=1) for (let x=0; x<10; x+=1) candidates.push({start:[x,y],direction});
    let placed = false;
    while (candidates.length && !placed) {
      const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
      const [candidate] = candidates.splice(index,1);
      placed = board.placeShip(length,candidate.start,candidate.direction);
    }
    if (!placed) throw new Error('Unable to place fleet.');
  }
  return board;
}

export class Game {
  constructor(human = new Player(), computer = new Player('computer'), random = Math.random) {
    this.human = human; this.computer = computer; this.random = random; this.phase = 'setup'; this.winner = null;
  }
  start() {
    if (this.phase !== 'setup' || !this.human.board.ships.length || !this.computer.board.ships.length) return false;
    this.phase = 'playing'; return true;
  }
  fire(square) {
    if (this.phase !== 'playing') return {legal:false};
    const human = this.computer.board.receiveAttack(square);
    if (!human.legal) return {legal:false};
    if (this.computer.board.allSunk()) { this.phase = 'over'; this.winner = 'human'; return {legal:true,human}; }
    const target = this.computer.chooseAttack(this.human.board,this.random);
    const computer = this.human.board.receiveAttack(target);
    if (this.human.board.allSunk()) { this.phase = 'over'; this.winner = 'computer'; }
    return {legal:true,human,computer,target};
  }
}
