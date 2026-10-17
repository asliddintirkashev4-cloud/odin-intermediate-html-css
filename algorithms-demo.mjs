import {fibs, fibsRec} from './recursion-fibonacci.mjs';
import {mergeSort} from './recursion-merge-sort.mjs';
import {LinkedList} from './linked-list.mjs';
import {HashMap} from './hash-map.mjs';
import {Tree} from './binary-search-tree.mjs';
import {knightMoves} from './knights-travails.mjs';

console.log('Iterative Fibonacci:', fibs(8));
console.log('Recursive Fibonacci:', fibsRec(8, console.log));
console.log('Merge sort:', mergeSort([3,2,1,13,8,5,0,1]));
const list = new LinkedList();
['dog','cat','parrot','hamster','snake','turtle'].forEach(value => list.append(value));
console.log(list.toString());
const map = new HashMap();
Object.entries({apple:'red',banana:'yellow',carrot:'orange',dog:'brown',elephant:'gray',frog:'green',grape:'purple',hat:'black','ice cream':'white',jacket:'blue',kite:'pink',lion:'golden'}).forEach(([key,value]) => map.set(key,value));
console.log('Before expansion:', map.length(), map.capacity);
map.set('apple','green'); map.set('moon','silver');
console.log('After expansion:', map.length(), map.capacity, map.entries());
const tree = new Tree(Array.from({length:20}, () => Math.floor(Math.random() * 100)));
function showOrders() {
  for (const method of ['levelOrderForEach','preOrderForEach','postOrderForEach','inOrderForEach']) {
    const values = []; tree[method](value => values.push(value)); console.log(method, values.join(', '));
  }
}
console.log('Initially balanced:', tree.isBalanced()); showOrders();
[101,102,103,104,105,106,107].forEach(value => tree.insert(value));
console.log('Balanced after insertion:', tree.isBalanced());
tree.rebalance(); console.log('Balanced after rebalancing:', tree.isBalanced()); showOrders();
for (const [start,end] of [[[0,0],[1,2]],[[0,0],[3,3]],[[3,3],[0,0]],[[0,0],[7,7]],[[3,3],[4,3]]]) {
  const path = knightMoves(start,end);
  console.log(`You made it in ${path.length - 1} moves! Here is your path:`);
  path.forEach(square => console.log(square));
}
