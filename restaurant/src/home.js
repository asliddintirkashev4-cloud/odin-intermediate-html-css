import plate from './plate.svg';
import {node, footer} from './dom.js';

export default function showHome(container) {
  const page = node('div', '', 'page');
  const hero = node('main', '', 'hero');
  const copy = node('div', '', 'hero-copy');
  copy.append(node('p', 'Italian-inspired / Made with care', 'eyebrow'), node('h1', 'Good food.\nSlow evenings.'), node('p', 'Fresh pasta, something seasonal, and a seat at the table. Nothing complicated. Just a good reason to stay a little longer.', 'lead'));
  const menu = node('button', 'Discover the menu ↗', 'primary');
  menu.type = 'button';
  menu.dataset.view = 'menu';
  copy.append(menu, node('p', 'Come hungry. Leave happy.', 'small-note'));
  const image = node('img');
  image.src = plate;
  image.alt = 'An original illustration of fresh pasta with basil on a ceramic plate';
  image.width = 600;
  image.height = 600;
  const figure = node('figure');
  figure.append(image, node('figcaption', 'Simple ingredients. A generous plate.'));
  hero.append(copy, figure);
  const note = node('section', '', 'home-note');
  note.append(node('h2', 'A little less hurry.'), node('p', 'We like a meal that becomes a conversation. Our imagined kitchen takes its cue from the Italian table: a few good ingredients, made thoughtfully, shared easily.'));
  page.append(hero, note, footer());
  container.append(page);
}
