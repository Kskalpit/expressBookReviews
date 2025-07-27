const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// --- Simulate async book fetching using Promise ---
function getBooksAsync() {
    return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      } else {
        reject("Books not found");
      }
    });
  }
  
  // --- Route using async/await ---
  public_users.get('/', async function (req, res) {
    try {
      const allBooks = await getBooksAsync();
      res.status(200).json(allBooks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching books", error });
    }
  });

// --- Simulated async fetch for a book by ISBN ---
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
  }
  
  // --- Route using async/await ---
  public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
  
    try {
      const book = await getBookByISBN(isbn);
      res.status(200).json(book);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  });

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists. Please choose another." });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully!" });
});

  
// Get book details based on author
// --- Simulated async function to get books by author ---
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];
  
      for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
          matchingBooks.push({ isbn: key, ...books[key] });
        }
      }
  
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found for this author");
      }
    });
  }

// --- Route to get books by author using async/await ---
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      const booksByAuthor = await getBooksByAuthor(author);
      res.status(200).json(booksByAuthor);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  });

// Get all books based on title
// --- Simulated async function to get books by title ---
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
      const matchingBooks = [];
  
      for (let key in books) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
          matchingBooks.push({ isbn: key, ...books[key] });
        }
      }
  
      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with that title");
      }
    });
  }
  public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
  
    try {
      const booksByTitle = await getBooksByTitle(title);
      res.status(200).json(booksByTitle);
    } catch (error) {
      res.status(404).json({ message: error });
    }
  });  

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
    }
});

module.exports.general = public_users;
