import {node, footer} from './dom.js';

const dishes = [
  ['To begin', [['Tomatoes & burrata', 'Ripe tomatoes, creamy burrata, basil and olive oil.', '€12'], ['Warm focaccia', 'Rosemary, flaky salt and olive oil for dipping.', '€6']]],
  ['Something comforting', [['Lemon tagliatelle', 'Fresh ribbons, lemon butter and aged parmesan.', '€18'], ['Sunday ragù', 'Slow-cooked tomato sauce, mushrooms and rigatoni.', '€19'], ['Roasted garden plate', 'Seasonal vegetables, white beans and herb dressing.', '€17']]],
  ['One more good thing', [['Tiramisu', 'Coffee, mascarpone and a generous dusting of cocoa.', '€8']]],
];

export default function showMenu(container) {
  const page = node('div', '', 'page');
  const main = node('main', '', 'menu-page');
  main.append(node('p', 'From our imagined kitchen', 'eyebrow'), node('h1', 'A good appetite.'), node('p', 'A short menu. Plenty to enjoy.', 'lead'));
  for (const [category, items] of dishes) {
    const section = node('section', '', 'menu-section');
    section.append(node('h2', category));
    const list = node('div', '', 'dish-list');
    for (const [title, description, price] of items) {
      const dish = node('article', '', 'dish');
      const heading = node('div');
      heading.append(node('h3', title), node('span', price));
      dish.append(heading, node('p', description));
      list.append(dish);
    }
    section.append(list);
    main.append(section);
  }
  main.append(node('p', 'Demonstration menu and prices. Please discuss allergies with the kitchen when visiting a real restaurant.', 'small-note'));
  page.append(main, footer());
  container.append(page);
}
