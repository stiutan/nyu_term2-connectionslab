async function loadBooks() {
  const response = await fetch("./data/poisonous_books.json");
  const books = await response.json();

  renderBooks(books);
}

let viewedBooks = new Set();
const maxViewedBooks = 10;

function renderBooks(books) {
  const bookshelfGrid = document.querySelector(".bookshelf-grid");

  let numBookshelves = 5;
  let numBooksPerRow = 10;
  let numBooksPerRowInGrid = numBookshelves * numBooksPerRow;

  let bookshelves = [];
  for (let i = 0; i < numBookshelves; i++) {
    let bookshelf = document.createElement("div");
    bookshelf.classList.add("bookshelf");

    bookshelfGrid.appendChild(bookshelf);
    bookshelves.push(bookshelf);
  }

  [...books, ...books.slice(0, -6)].forEach((book, i) => {
    const posInRow = i % numBooksPerRowInGrid;
    const colIndex = Math.floor(posInRow / numBooksPerRow);

    const bookDiv = document.createElement("div");
    bookDiv.classList.add("book");
    bookDiv.innerHTML = getBookInnerHtml(book);

    // when mouse presses down (diff from 'click' event)
    // take this as if the user pulled the book off the shelf
    bookDiv.addEventListener("mousedown", () => {
      // update poison view
      viewedBooks.add(bookDiv);
      const progress = viewedBooks.size / maxViewedBooks;
      const poisonLevel = Math.pow(progress, 2);
      updatePoisonLevel(poisonLevel);

      // make new clicked book lay on top of others
      bookDiv.classList.add("clicked");
      bookDiv.style.zIndex = viewedBooks.size;

      if (viewedBooks.size >= maxViewedBooks) {
        triggerPoisonEnding();
      }
    });

    bookshelves[colIndex].appendChild(bookDiv);
  });
}

function getBookInnerHtml(book) {
  return `
    <div class="book-marker"></div>

    <div class="book-card">
      <div class="book-card-top">
        <div class="book-title">${book.title}</div>
        <div class="book-author">by ${book.author}</div>
      </div>

      <div class="book-card-bottom">
        <div class="book-year">${book.year}</div>
        <div class="book-material">toxic ${book.toxicMaterial}</div>
      </div>
    </div>
  `;
}

loadBooks();
