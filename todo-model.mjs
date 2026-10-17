const STORAGE_KEY = 'fieldnotes-todos-v1';

export class Todo {
  constructor({title, description = '', dueDate = '', priority = 'medium', completed = false, id = crypto.randomUUID()}) {
    if (typeof title !== 'string' || !title.trim()) throw new TypeError('Enter a task title.');
    if (!['low', 'medium', 'high'].includes(priority)) throw new TypeError('Choose a valid priority.');
    if (dueDate) {
      const date = new Date(`${dueDate}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== dueDate) throw new TypeError('Choose a valid date.');
    }
    this.id = id;
    this.title = title.trim();
    this.description = String(description);
    this.dueDate = dueDate;
    this.priority = priority;
    this.completed = Boolean(completed);
  }
  setCompleted(value) { this.completed = Boolean(value); }
}

export function createTodoStore(storage = null) {
  let warning = '';
  let projects = [{id: 'inbox', title: 'Inbox', todos: []}];
  try {
    const saved = storage?.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.version !== 1 || !Array.isArray(data.projects)) throw new Error('Invalid stored data.');
      const ids = new Set();
      projects = data.projects.map(project => {
        if (typeof project.id !== 'string' || !project.id || typeof project.title !== 'string' || !project.title.trim() || !Array.isArray(project.todos) || ids.has(project.id)) throw new Error('Invalid project.');
        ids.add(project.id);
        return {id: project.id, title: project.title, todos: project.todos.map(todo => {
          if (typeof todo.id !== 'string' || !todo.id || ids.has(todo.id)) throw new Error('Invalid task.');
          ids.add(todo.id);
          return new Todo(todo);
        })};
      });
      if (!projects.some(project => project.id === 'inbox')) projects.unshift({id: 'inbox', title: 'Inbox', todos: []});
    }
  } catch {
    projects = [{id: 'inbox', title: 'Inbox', todos: []}];
    warning = 'Saved tasks could not be loaded. New changes will replace the unreadable saved data.';
  }
  function persist() {
    if (!storage) { warning = 'Changes will last for this session; browser storage is unavailable.'; return; }
    try { storage.setItem(STORAGE_KEY, JSON.stringify({version: 1, projects})); warning = ''; }
    catch { warning = 'Changes are available in this session, but could not be saved.'; }
  }
  function projectById(id) {
    const project = projects.find(project => project.id === id);
    if (!project) throw new Error('Project not found.');
    return project;
  }
  function findTask(id) {
    for (const project of projects) {
      const index = project.todos.findIndex(todo => todo.id === id);
      if (index !== -1) return {project, index, todo: project.todos[index]};
    }
    throw new Error('Task not found.');
  }
  return {
    snapshot() { return JSON.parse(JSON.stringify({projects, warning})); },
    addProject(title) {
      if (typeof title !== 'string' || !title.trim()) throw new TypeError('Enter a project name.');
      const project = {id: crypto.randomUUID(), title: title.trim(), todos: []};
      projects.push(project);
      persist();
      return project.id;
    },
    addTask(projectId, fields) {
      const todo = new Todo(fields);
      projectById(projectId).todos.push(todo);
      persist();
      return todo.id;
    },
    updateTask(id, fields, destinationId) {
      const found = findTask(id);
      const destination = projectById(destinationId ?? found.project.id);
      const replacement = new Todo({...found.todo, ...fields, id});
      if (destination === found.project) found.project.todos[found.index] = replacement;
      else { found.project.todos.splice(found.index, 1); destination.todos.push(replacement); }
      persist();
    },
    setCompleted(id, value) { findTask(id).todo.setCompleted(value); persist(); },
    deleteTask(id) { const found = findTask(id); found.project.todos.splice(found.index, 1); persist(); },
  };
}
