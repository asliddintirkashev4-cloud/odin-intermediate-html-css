function valid(square) { return Array.isArray(square) && square.length === 2 && square.every(value => Number.isInteger(value) && value >= 0 && value < 8); }
const offsets = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];

export function knightMoves(start, end) {
  if (!valid(start) || !valid(end)) throw new RangeError('Squares must have two integer coordinates from 0 to 7.');
  const queue = [[...start]];
  const visited = Array.from({length:8}, () => Array(8).fill(false));
  const parent = Array.from({length:8}, () => Array(8).fill(null));
  visited[start[0]][start[1]] = true;
  for (let index = 0; index < queue.length; index += 1) {
    const square = queue[index];
    if (square[0] === end[0] && square[1] === end[1]) {
      const path = [];
      for (let current = square; current; current = parent[current[0]][current[1]]) path.push([...current]);
      return path.reverse();
    }
    for (const [dx,dy] of offsets) {
      const next = [square[0]+dx, square[1]+dy];
      if (!valid(next) || visited[next[0]][next[1]]) continue;
      visited[next[0]][next[1]] = true;
      parent[next[0]][next[1]] = square;
      queue.push(next);
    }
  }
  throw new Error('No path found.');
}
