import test from 'node:test';
import assert from 'node:assert/strict';
import {shuffle,selectCard} from './game.js';
test('a fresh choice increases current and best scores; a duplicate loses the round',()=>{
  const start={selected:[],best:0,outcome:'playing'};
  const first=selectCard(start,1,3);
  assert.deepEqual(first,{selected:[1],best:1,outcome:'playing'});
  const second=selectCard(first,2,3);
  assert.deepEqual(second,{selected:[1,2],best:2,outcome:'playing'});
  assert.deepEqual(selectCard(second,1,3),{selected:[],best:2,outcome:'lost'});
  assert.deepEqual(start,{selected:[],best:0,outcome:'playing'});
});
test('all unique cards win and completed rounds ignore further choices',()=>{
  const state={selected:[1,2],best:7,outcome:'playing'};
  const won=selectCard(state,3,3);
  assert.deepEqual(won,{selected:[1,2,3],best:7,outcome:'won'});
  assert.equal(selectCard(won,1,3),won);
});
test('Fisher-Yates shuffle preserves cards and does not mutate its input',()=>{
  const input=[1,2,3];
  assert.deepEqual(shuffle(input,()=>0),[2,3,1]);
  assert.deepEqual(input,[1,2,3]);
  assert.deepEqual(shuffle([]),[]);
});
