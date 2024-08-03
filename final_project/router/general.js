const express = require("express");
const axios = require("axios");
const books = require("./booksdb.js");
const public_users = express.Router();

// Function to get the list of books from the API
const getBooks = async () => {
  try {
    return books;
  } catch (error) {
    throw new Error("Error fetching books");
  }
};

// Function to get a book by ISBN from the API
const getBookByISBN = async (isbn) => {
  try {
    const book = books[isbn];
    if (!book) throw new Error("Book not found");
    return book;
  } catch (error) {
    throw new Error("Error fetching book by ISBN");
  }
};

// Function to get a book by title from the API
const getBookByTitle = async (title) => {
  try {
    const book = Object.values(books).find(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (!book) throw new Error("Book not found");
    return book;
  } catch (error) {
    throw new Error("Error fetching book by title");
  }
};

// Function to get books by author from the API
const getBooksByAuthor = async (author) => {
  try {
    const booksByAuthor = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );
    if (booksByAuthor.length === 0)
      throw new Error("No books found by this author");
    return booksByAuthor;
  } catch (error) {
    throw new Error("Error fetching books by author");
  }
};

// Get the list of books available in the shop
public_users.get("/", async (req, res) => {
  try {
    const booksList = await getBooks();
    res.json(booksList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const book = await getBookByTitle(title);
    res.json(book);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    res.json(booksByAuthor);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get book reviews based on title
public_users.get("/review/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const book = Object.values(books).find(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (book && book.reviews) {
      res.json(book.reviews);
    } else {
      res.status(404).json({ message: "Reviews not found for this book" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
public_users.put("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username, review, rating } = req.body; // Assuming `username` is included in the request body

  if (!review || rating === undefined || !username) {
    return res
      .status(400)
      .json({ message: "Review, rating, and username are required" });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews if not already present
  if (!book.reviews) {
    book.reviews = [];
  }

  // Check if a review from this user already exists
  const existingReview = book.reviews.find((r) => r.reviewer === username);
  if (existingReview) {
    // Update existing review
    existingReview.comment = review;
    existingReview.rating = rating;
  } else {
    // Add new review
    book.reviews.push({ reviewer: username, comment: review, rating });
  }

  res.json({ message: "Review added/updated successfully" });
});
public_users.delete("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username } = req.body; // Assuming `username` is included in the request body

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!book.reviews) {
    return res.status(404).json({ message: "No reviews to delete" });
  }

  // Filter out the review from this user
  const initialLength = book.reviews.length;
  book.reviews = book.reviews.filter((r) => r.reviewer !== username);

  if (book.reviews.length === initialLength) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  res.json({ message: "Review deleted successfully" });
});

module.exports.general = public_users;
