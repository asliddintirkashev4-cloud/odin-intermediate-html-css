import {node, footer} from './dom.js';

export default function showContact(container) {
  const page = node('div', '', 'page');
  const main = node('main', '', 'contact-page');
  main.append(node('p', 'Pull up a chair', 'eyebrow'), node('h1', 'There’s a place\nfor you here.'), node('p', 'An imagined neighborhood spot, with time for one more story.', 'lead'));
  const details = node('div', '', 'contact-details');
  const location = node('section');
  location.append(node('h2', 'Find our fictional table'), node('p', '14 Via del Sole\nExample City'), node('p', 'This address is sample content for the project.', 'small-note'));
  const hours = node('section');
  hours.append(node('h2', 'Opening hours'));
  const list = node('dl');
  for (const [day, time] of [['Tuesday – Thursday', '17:00 – 22:00'], ['Friday – Saturday', '12:00 – 23:00'], ['Sunday', '12:00 – 20:00'], ['Monday', 'A day to rest']]) list.append(node('dt', day), node('dd', time));
  hours.append(list);
  const bookings = node('section');
  bookings.append(node('h2', 'A note on bookings'), node('p', 'This is a fictional restaurant website. It does not accept reservations or send messages.'));
  details.append(location, hours, bookings);
  main.append(details);
  page.append(main, footer());
  container.append(page);
}
