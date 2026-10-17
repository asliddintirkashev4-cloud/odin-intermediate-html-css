import test from 'node:test';
import assert from 'node:assert/strict';
import {createTodoStore, Todo} from './todo-model.mjs';
const memoryStorage = () => { const data = new Map(); return {getItem:key=>data.get(key)??null, setItem:(key,value)=>data.set(key,value)}; };

test('projects, IDs, task details and methods survive a storage round trip', () => {
  const storage = memoryStorage();
  const first = createTodoStore(storage);
  const project = first.addProject('Garden');
  const id = first.addTask(project, {title:'Plant basil', description:'Use the sunny window.', dueDate:'2026-11-20', priority:'high'});
  const second = createTodoStore(storage);
  second.setCompleted(id, true);
  const restored = createTodoStore(storage).snapshot().projects.find(item=>item.id===project).todos[0];
  assert.equal(restored.id, id);
  assert.equal(restored.completed, true);
  assert.equal(restored.dueDate, '2026-11-20');
  assert.equal(restored.priority, 'high');
  assert.equal(restored.description, 'Use the sunny window.');
});
test('editing can move a task without duplicating it or changing its ID', () => {
  const store = createTodoStore(memoryStorage());
  const project = store.addProject('Work');
  const id = store.addTask('inbox', {title:'First title'});
  store.updateTask(id, {title:'Updated title', priority:'low'}, project);
  const state = store.snapshot();
  assert.equal(state.projects[0].todos.length, 0);
  assert.equal(state.projects.find(item=>item.id===project).todos[0].id, id);
  assert.equal(state.projects.find(item=>item.id===project).todos[0].title, 'Updated title');
});
test('deletions persist and empty storage yields an Inbox', () => {
  const storage = memoryStorage();
  const store = createTodoStore(storage);
  assert.equal(store.snapshot().projects[0].title, 'Inbox');
  const id = store.addTask('inbox', {title:'Temporary task'});
  store.deleteTask(id);
  assert.equal(createTodoStore(storage).snapshot().projects[0].todos.length, 0);
});
test('invalid dates and blank titles are rejected without changing tasks', () => {
  assert.throws(()=>new Todo({title:' '}));
  assert.throws(()=>new Todo({title:'Bad date', dueDate:'2026-02-30'}));
  assert.throws(()=>new Todo({title:'Bad priority', priority:'urgent'}));
});
test('unavailable storage does not prevent an in-memory session', () => {
  const store = createTodoStore({getItem:()=>null, setItem:()=>{throw new Error('Full');}});
  store.addTask('inbox', {title:'Keep working'});
  assert.equal(store.snapshot().projects[0].todos.length, 1);
  assert.match(store.snapshot().warning, /could not be saved/);
});
