import {createTodoStore} from './todo-model.mjs';

let storage = null;
try { storage = window.localStorage; } catch { /* The store supports an in-memory session. */ }
const store = createTodoStore(storage);
let currentProject = 'inbox';
let editingId = null;
const projectList = document.querySelector('#project-list');
const tasks = document.querySelector('#tasks');
const filter = document.querySelector('#filter');
const dialog = document.querySelector('#task-dialog');
const form = document.querySelector('#task-form');
const announcement = document.querySelector('#announcement');

function dateLabel(value) {
  if (!value) return 'No due date';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en', {month:'short', day:'numeric', year:'numeric'}).format(new Date(year, month - 1, day));
}
function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function render() {
  const state = store.snapshot();
  const selected = state.projects.find(project => project.id === currentProject);
  projectList.replaceChildren();
  for (const project of state.projects) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.projectId = project.id;
    button.setAttribute('aria-pressed', String(project.id === currentProject));
    button.append(document.createTextNode(project.title));
    const count = document.createElement('span');
    count.textContent = project.todos.filter(todo => !todo.completed).length;
    button.append(count);
    projectList.append(button);
  }
  document.querySelector('#project-title').textContent = selected.title;
  document.querySelector('#task-count').textContent = `${selected.todos.filter(todo=>!todo.completed).length} to do · ${selected.todos.filter(todo=>todo.completed).length} completed`;
  tasks.replaceChildren();
  const visible = selected.todos.filter(todo => filter.value === 'all' || (filter.value === 'done' ? todo.completed : !todo.completed));
  for (const todo of visible) {
    const article = document.createElement('article');
    article.className = `task${todo.completed ? ' complete' : ''}`;
    article.dataset.taskId = todo.id;
    article.dataset.priority = todo.priority;
    article.innerHTML = '<input type="checkbox"><details><summary><span class="task-title"></span><span class="due"></span></summary><div class="details-body"><p class="description"></p><div class="task-actions"><span class="priority"></span><button type="button" class="edit">Edit</button><button type="button" class="delete">Delete</button></div></div></details>';
    article.querySelector('input').checked = todo.completed;
    article.querySelector('input').setAttribute('aria-label', `Complete ${todo.title}`);
    article.querySelector('.task-title').textContent = todo.title;
    const due = article.querySelector('.due');
    due.textContent = dateLabel(todo.dueDate);
    due.classList.toggle('overdue', Boolean(todo.dueDate && todo.dueDate < today() && !todo.completed));
    article.querySelector('.description').textContent = todo.description || 'No description added.';
    article.querySelector('.priority').textContent = `${todo.priority[0].toUpperCase()+todo.priority.slice(1)} priority`;
    article.querySelector('.edit').setAttribute('aria-label', `Edit ${todo.title}`);
    article.querySelector('.delete').setAttribute('aria-label', `Delete ${todo.title}`);
    tasks.append(article);
  }
  document.querySelector('#empty').hidden = visible.length !== 0;
  document.querySelector('#storage-warning').textContent = state.warning;
}
function openTask(todo = null) {
  editingId = todo?.id ?? null;
  form.reset();
  document.querySelector('#dialog-title').textContent = todo ? 'A little refinement.' : 'A fresh thought.';
  form.elements.title.value = todo?.title ?? '';
  form.elements.description.value = todo?.description ?? '';
  form.elements.due_date.value = todo?.dueDate ?? '';
  form.elements.priority.value = todo?.priority ?? 'medium';
  form.elements.project.replaceChildren();
  for (const project of store.snapshot().projects) {
    const option = document.createElement('option');
    option.value = project.id;
    option.textContent = project.title;
    option.selected = project.id === currentProject;
    form.elements.project.append(option);
  }
  document.querySelector('#form-error').textContent = '';
  dialog.showModal();
}
projectList.addEventListener('click', event => {
  const button = event.target.closest('[data-project-id]');
  if (!button) return;
  currentProject = button.dataset.projectId;
  render();
});
document.querySelector('#project-form').addEventListener('submit', event => {
  event.preventDefault();
  const input = event.target.elements.project_name;
  try {
    currentProject = store.addProject(input.value);
    input.value = '';
    render();
    announcement.textContent = 'Project created.';
  } catch (error) { input.setCustomValidity(error.message); input.reportValidity(); }
});
document.querySelector('#project-name').addEventListener('input', event => event.target.setCustomValidity(''));
document.querySelector('#add-task').addEventListener('click', () => openTask());
document.querySelector('#cancel-task').addEventListener('click', () => dialog.close());
filter.addEventListener('change', render);
form.addEventListener('submit', event => {
  event.preventDefault();
  const fields = {title:form.elements.title.value, description:form.elements.description.value, dueDate:form.elements.due_date.value, priority:form.elements.priority.value};
  try {
    if (editingId) store.updateTask(editingId, fields, form.elements.project.value);
    else store.addTask(form.elements.project.value, fields);
    currentProject = form.elements.project.value;
    dialog.close();
    render();
    announcement.textContent = 'Task saved.';
  } catch (error) { document.querySelector('#form-error').textContent = error.message; }
});
tasks.addEventListener('change', event => {
  const article = event.target.closest('[data-task-id]');
  if (article && event.target.matches('input[type=checkbox]')) {
    store.setCompleted(article.dataset.taskId, event.target.checked);
    render();
    announcement.textContent = 'Task status updated.';
  }
});
tasks.addEventListener('click', event => {
  const article = event.target.closest('[data-task-id]');
  if (!article) return;
  if (event.target.closest('.delete')) { store.deleteTask(article.dataset.taskId); render(); announcement.textContent = 'Task deleted.'; }
  else if (event.target.closest('.edit')) {
    const todo = store.snapshot().projects.find(project => project.id === currentProject).todos.find(todo => todo.id === article.dataset.taskId);
    openTask(todo);
  }
});
render();
