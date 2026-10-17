'use strict';

const grid = document.querySelector('#project-grid');
const search = document.querySelector('#search');
const filter = document.querySelector('#filter');
const feedback = document.querySelector('#feedback');
const dialog = document.querySelector('#project-dialog');
const preview = document.querySelector('#preview-dialog');
let starred = new Set();
try {
  const saved = JSON.parse(localStorage.getItem('fieldwork-starred') || '[]');
  if (Array.isArray(saved)) starred = new Set(saved.filter((id) => typeof id === 'string'));
} catch { /* The dashboard also works when browser storage is unavailable. */ }

function updateProjects() {
  const query = search.value.trim().toLocaleLowerCase();
  let visible = 0;
  for (const project of grid.children) {
    const isStarred = starred.has(project.dataset.id);
    const star = project.querySelector('.star');
    star.setAttribute('aria-pressed', String(isStarred));
    star.textContent = isStarred ? '★' : '☆';
    project.hidden = !project.textContent.toLocaleLowerCase().includes(query) || (filter.value === 'starred' && !isStarred);
    if (!project.hidden) visible += 1;
  }
  document.querySelector('#count').textContent = String(visible);
  document.querySelector('nav small').textContent = String(grid.children.length).padStart(2, '0');
  document.querySelector('#empty').hidden = visible !== 0;
  feedback.textContent = `${visible} project${visible === 1 ? '' : 's'} shown.`;
}

document.querySelector('.search').addEventListener('submit', (event) => event.preventDefault());
search.addEventListener('input', updateProjects);
filter.addEventListener('change', updateProjects);
grid.addEventListener('click', (event) => {
  const star = event.target.closest('.star');
  if (star) {
    const id = star.closest('.project').dataset.id;
    if (starred.has(id)) starred.delete(id); else starred.add(id);
    try { localStorage.setItem('fieldwork-starred', JSON.stringify([...starred])); } catch { /* In-memory stars remain usable. */ }
    updateProjects();
  }
  const trigger = event.target.closest('.preview');
  if (trigger) {
    const project = trigger.closest('.project');
    document.querySelector('#preview-title').textContent = project.querySelector('h3').textContent;
    document.querySelector('#preview-description').textContent = project.querySelector('p:not(.category)').textContent;
    preview.showModal();
  }
});

document.querySelector('#new-project').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#close-preview').addEventListener('click', () => preview.close());
document.querySelector('#project-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const title = document.querySelector('#project-title').value.trim();
  const description = document.querySelector('#project-description').value.trim();
  if (!title || !description) return;
  const project = document.createElement('article');
  project.className = 'project';
  project.dataset.id = `session-${crypto.randomUUID()}`;
  // This template is fixed. User content is inserted only through textContent.
  project.innerHTML = '<p class="category">PERSONAL / DEMO</p><h3></h3><p class="description"></p><div class="project-footer"><span class="status planned">Session project</span><div><button class="star" type="button" aria-pressed="false">☆</button><button class="preview" type="button">↗</button></div></div>';
  project.querySelector('h3').textContent = title;
  project.querySelector('.description').textContent = description;
  project.querySelector('.star').setAttribute('aria-label', `Star ${title}`);
  project.querySelector('.preview').setAttribute('aria-label', `Preview ${title}`);
  grid.prepend(project);
  search.value = '';
  filter.value = 'all';
  updateProjects();
  feedback.textContent = `Created ${title}. It will remain until this page is reloaded.`;
  event.target.reset();
  dialog.close();
});
updateProjects();
