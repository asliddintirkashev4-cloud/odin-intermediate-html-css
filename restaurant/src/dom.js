export function node(tag, text = '', className = '') {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

export function footer() {
  const element = node('footer');
  element.append(node('span', 'casa lento / Take your time.'), node('span', 'Fictional restaurant · Course project'));
  return element;
}
