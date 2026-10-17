const authorMode = document.body.dataset.mode === 'author';
const defaultBase = new URL('api/', location.href).href.replace(/\/$/, '');
let apiBase = localStorage.getItem('odin-blog-api') || defaultBase;
const tokenKey = () => 'odin-blog-token:' + apiBase;
const status = document.querySelector('#status');
const list = document.querySelector('#posts');
const detail = document.querySelector('#detail');
const postForm = document.querySelector('#post-form');
const loginForm = document.querySelector('#login-form');
document.querySelector('#api-base').value = apiBase;
function node(tag, text, className) { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (className) e.className = className; return e; }
function action(fn) { return async event => { event?.preventDefault(); try { status.textContent = ''; await fn(event); } catch (error) { status.textContent = error.message; } }; }
function button(text, handler) { const b = node('button', text); b.type = 'button'; b.addEventListener('click', action(handler)); return b; }
async function api(path, options = {}) {
  const token = localStorage.getItem(tokenKey());
  const response = await fetch(apiBase + path, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(authorMode && token ? { Authorization: 'Bearer ' + token } : {}), ...options.headers } });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({ error: 'The API did not return JSON. Check its address.' }));
  if (!response.ok) {
    if (response.status === 401 && authorMode) { localStorage.removeItem(tokenKey()); updateAuth(); }
    throw new Error(data.error || 'Request failed.');
  }
  return data;
}
function updateAuth() {
  if (!authorMode) return;
  const signedIn = Boolean(localStorage.getItem(tokenKey()));
  loginForm.hidden = signedIn;
  postForm.hidden = !signedIn;
  document.querySelector('#logout').hidden = !signedIn;
}
async function loadPosts() {
  list.replaceChildren(node('p', 'Loading posts…'));
  const draftQuery = authorMode && localStorage.getItem(tokenKey()) ? '?drafts=true' : '';
  const { posts } = await api('/posts' + draftQuery);
  list.replaceChildren();
  if (!posts.length) list.append(node('p', 'No posts yet.', 'empty'));
  for (const post of posts) {
    const card = node('article');
    card.append(node('h2', post.title), node('p', new Date(post.createdAt).toLocaleDateString() + ' · ' + post.author.firstName + ' ' + post.author.lastName, 'muted'));
    if (authorMode) card.append(node('span', post.published ? 'Published' : 'Draft', 'badge'));
    card.append(node('p', post.content.slice(0, 180) + (post.content.length > 180 ? '…' : '')));
    const actions = node('div', undefined, 'actions');
    actions.append(button(authorMode ? 'Open & edit' : 'Read post', () => openPost(post.id)));
    if (authorMode && localStorage.getItem(tokenKey())) {
      actions.append(button(post.published ? 'Unpublish' : 'Publish', async () => { await api('/posts/' + post.id, { method: 'PUT', body: JSON.stringify({ title: post.title, content: post.content, published: !post.published }) }); await loadPosts(); }));
      const remove = button('Delete post', async () => { await api('/posts/' + post.id, { method: 'DELETE' }); detail.replaceChildren(); await loadPosts(); });
      remove.className = 'danger'; actions.append(remove);
    }
    card.append(actions); list.append(card);
  }
}
async function openPost(id) {
  const { post } = await api('/posts/' + id);
  detail.replaceChildren();
  const article = node('article');
  article.append(node('h2', post.title), node('p', post.content));
  detail.append(article, node('h2', 'Comments'));
  if (authorMode && localStorage.getItem(tokenKey())) {
    postForm.elements.id.value = post.id; postForm.elements.title.value = post.title; postForm.elements.content.value = post.content; postForm.elements.published.checked = post.published;
  }
  if (!post.comments.length) detail.append(node('p', 'No comments yet.'));
  for (const comment of post.comments) {
    const row = node('article');
    row.append(node('h3', comment.name), node('p', comment.text), node('time', new Date(comment.createdAt).toLocaleString()));
    if (authorMode && localStorage.getItem(tokenKey())) {
      const edit = node('form');
      const nameLabel = node('label', 'Comment author'); const name = node('input'); name.value = comment.name; name.required = true; name.maxLength = 80; nameLabel.append(name);
      const textLabel = node('label', 'Comment text'); const text = node('textarea'); text.value = comment.text; text.required = true; text.maxLength = 2000; textLabel.append(text);
      const save = node('button', 'Save comment');
      edit.append(nameLabel, textLabel, save);
      edit.addEventListener('submit', action(async () => { await api('/posts/' + id + '/comments/' + comment.id, { method: 'PUT', body: JSON.stringify({ name: name.value, text: text.value }) }); await openPost(id); }));
      row.append(edit, button('Delete comment', async () => { await api('/posts/' + id + '/comments/' + comment.id, { method: 'DELETE' }); await openPost(id); }));
    }
    detail.append(row);
  }
  if (!authorMode && post.published) {
    const form = node('form');
    const authorLabel = node('label', 'Your name'); const name = node('input'); name.name = 'name'; name.required = true; name.maxLength = 80; authorLabel.append(name);
    const textLabel = node('label', 'Your comment'); const text = node('textarea'); text.name = 'text'; text.required = true; text.maxLength = 2000; textLabel.append(text);
    form.append(authorLabel, textLabel, node('button', 'Post comment'));
    form.addEventListener('submit', action(async () => { await api('/posts/' + id + '/comments', { method: 'POST', body: JSON.stringify({ name: name.value, text: text.value }) }); await openPost(id); }));
    detail.append(form);
  }
  detail.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
document.querySelector('#api-settings').addEventListener('submit', action(async () => {
  const url = new URL(document.querySelector('#api-base').value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Use an HTTP(S) API address without credentials or query parameters.');
  apiBase = url.href.replace(/\/$/, ''); localStorage.setItem('odin-blog-api', apiBase); detail.replaceChildren(); updateAuth(); await loadPosts();
}));
if (authorMode) {
  loginForm.addEventListener('submit', action(async () => {
    const { token } = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email: loginForm.elements.email.value, password: loginForm.elements.password.value }) });
    localStorage.setItem(tokenKey(), token); loginForm.reset(); updateAuth(); await loadPosts();
  }));
  document.querySelector('#logout').addEventListener('click', action(async () => { localStorage.removeItem(tokenKey()); postForm.reset(); detail.replaceChildren(); updateAuth(); await loadPosts(); }));
  postForm.addEventListener('submit', action(async () => {
    const id = postForm.elements.id.value;
    const body = { title: postForm.elements.title.value, content: postForm.elements.content.value, published: postForm.elements.published.checked };
    await api('/posts' + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
    postForm.reset(); detail.replaceChildren(); await loadPosts(); status.textContent = 'Post saved.';
  }));
  document.querySelector('#new-post').addEventListener('click', () => { postForm.reset(); detail.replaceChildren(); postForm.elements.title.focus(); });
}
updateAuth(); action(loadPosts)();
