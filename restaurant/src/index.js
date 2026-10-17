import './style.css';
import showHome from './home.js';
import showMenu from './menu.js';
import showContact from './contact.js';

const content = document.querySelector('#content');
const pages = {home: showHome, menu: showMenu, contact: showContact};

function navigate(view) {
  if (!Object.hasOwn(pages, view)) return;
  content.replaceChildren();
  pages[view](content);
  for (const button of document.querySelectorAll('header [data-view]')) button.setAttribute('aria-pressed', String(button.dataset.view === view));
  document.title = `Casa Lento — ${view === 'home' ? 'Good food, slow evenings' : view === 'menu' ? 'Menu' : 'Contact'}`;
}

document.addEventListener('click', event => {
  const button = event.target.closest('button[data-view]');
  if (button) navigate(button.dataset.view);
});
navigate('home');
