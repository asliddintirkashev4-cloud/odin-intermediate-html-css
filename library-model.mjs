export class Book {
  constructor(title, author, pages, read = false) {
    if (typeof title !== 'string' || typeof author !== 'string' || !title.trim() || !author.trim()) throw new TypeError('Title and author are required.');
    if (!Number.isInteger(Number(pages)) || Number(pages) < 1) throw new RangeError('Pages must be a positive whole number.');
    this.id = crypto.randomUUID();
    this.title = title.trim();
    this.author = author.trim();
    this.pages = Number(pages);
    this.read = Boolean(read);
  }

  toggleRead() {
    this.read = !this.read;
    return this.read;
  }
}

export function addBookToLibrary(library, title, author, pages, read = false) {
  const book = new Book(title, author, pages, read);
  library.push(book);
  return book;
}

export function removeBookFromLibrary(library, id) {
  const index = library.findIndex(book => book.id === id);
  if (index < 0) return false;
  library.splice(index, 1);
  return true;
}
