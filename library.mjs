import {addBookToLibrary, removeBookFromLibrary} from './library-model.mjs';

const myLibrary = [];
addBookToLibrary(myLibrary, 'The Quiet Garden', 'M. Lane', 248, true);
addBookToLibrary(myLibrary, 'Notes from Elsewhere', 'R. Ellis', 192);
addBookToLibrary(myLibrary, 'A Map of Small Things', 'J. Morgan', 304);
const books = document.querySelector('#books');
const search = document.querySelector('#search');
const filter = document.querySelector('#read-filter');
const dialog = document.querySelector('#book-dialog');
const form = document.querySelector('#book-form');
const status = document.querySelector('#status');
form.noValidate = true;
const bookFields = ['title', 'author', 'pages'].map(name => form.elements[name]);
function validateBookField(field) {
  field.setCustomValidity('');
  const labels = {title: 'The book title', author: 'The author name', pages: 'The page count'};
  let message = '';
  if (!field.value.trim()) message = `${labels[field.name]} must be filled!`;
  else if (field.name === 'pages' && (!Number.isInteger(Number(field.value)) || Number(field.value) < 1)) message = 'Enter a positive whole number of pages.';
  else if (field.maxLength > 0 && field.value.length > field.maxLength) message = `Use at most ${field.maxLength} characters.`;
  field.setCustomValidity(message);
  field.setAttribute('aria-invalid', String(Boolean(message)));
  return message;
}
for (const field of bookFields) {
  field.addEventListener('input', () => {
    validateBookField(field);
    document.querySelector('#form-error').textContent = bookFields.map(validateBookField).filter(Boolean).join(' ');
  });
}

function renderLibrary() {
  books.replaceChildren();
  const term = search.value.trim().toLocaleLowerCase();
  const visible = myLibrary.filter(book => `${book.title} ${book.author}`.toLocaleLowerCase().includes(term) && (filter.value === 'all' || (filter.value === 'read' ? book.read : !book.read)));
  for (const book of visible) {
    const card = document.createElement('article');
    card.className = 'book';
    card.dataset.id = book.id;
    card.innerHTML = '<div class="cover"><p>Marginalia / Personal collection</p><h3></h3><small></small></div><div class="book-meta"><span class="author"></span><span class="pages"></span></div><div class="book-controls"><button class="toggle" type="button"></button><button class="remove" type="button">Remove</button></div>';
    card.querySelector('h3').textContent = book.title;
    card.querySelector('.cover small').textContent = book.author;
    card.querySelector('.author').textContent = book.author;
    card.querySelector('.pages').textContent = `${book.pages} pages`;
    const toggle = card.querySelector('.toggle');
    toggle.textContent = book.read ? 'Finished reading' : 'To read';
    toggle.setAttribute('aria-pressed', String(book.read));
    toggle.setAttribute('aria-label', `Finished reading ${book.title}`);
    card.querySelector('.remove').setAttribute('aria-label', `Remove ${book.title}`);
    books.append(card);
  }
  document.querySelector('#total').textContent = `${visible.length} / ${myLibrary.length}`;
  document.querySelector('#empty').hidden = visible.length > 0;
}

books.addEventListener('click', event => {
  const card = event.target.closest('.book');
  if (!card) return;
  const book = myLibrary.find(item => item.id === card.dataset.id);
  if (!book) return;
  if (event.target.closest('.toggle')) {
    book.toggleRead();
    status.textContent = `${book.title} marked ${book.read ? 'finished' : 'to read'}.`;
  } else if (event.target.closest('.remove')) {
    removeBookFromLibrary(myLibrary, book.id);
    status.textContent = `Removed ${book.title}.`;
  }
  renderLibrary();
});
search.addEventListener('input', renderLibrary);
filter.addEventListener('change', renderLibrary);
document.querySelector('#new-book').addEventListener('click', () => dialog.showModal());
document.querySelector('#cancel').addEventListener('click', () => dialog.close());
form.addEventListener('submit', event => {
  event.preventDefault();
  const errors = bookFields.map(validateBookField).filter(Boolean);
  if (errors.length) {
    document.querySelector('#form-error').textContent = errors.join(' ');
    bookFields.find(field => !field.validity.valid)?.focus();
    return;
  }
  try {
    const book = addBookToLibrary(myLibrary, form.elements.title.value, form.elements.author.value, form.elements.pages.value, form.elements.read.checked);
    search.value = '';
    filter.value = 'all';
    renderLibrary();
    form.reset();
    bookFields.forEach(field => field.removeAttribute('aria-invalid'));
    document.querySelector('#form-error').textContent = '';
    dialog.close();
    status.textContent = `Added ${book.title} to the collection.`;
  } catch (error) {
    document.querySelector('#form-error').textContent = error.message;
  }
});
renderLibrary();
