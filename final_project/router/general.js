const express = require("express");
const axios = require("axios");
const books = require("./booksdb.js");
const { isValid, users } = require("./auth_users.js");
const public_users = express.Router();

const BASE_URL = "http://localhost:3000"; // URL to your API

// Function to get the list of books from the API
const getBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books");
  }
};

// Function to get a book by ISBN from the API
const getBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching book by ISBN");
  }
};

// Function to get books by author from the API
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${author}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books by author");
  }
};

// Function to get books by title from the API
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${title}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching books by title");
  }
};

// Function to get book reviews by ISBN from the API
const getBookReviews = async (isbn) => {
  try {
    const response = await axios.get(`${BASE_URL}/review/${isbn}`);
    return response.data;
  } catch (error) {
    throw new Error("Error fetching book reviews");
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
    res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const booksByAuthor = await getBooksByAuthor(author);
    if (booksByAuthor.length > 0) {
      res.json(booksByAuthor);
    } else {
      res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const booksByTitle = await getBooksByTitle(title);
    if (booksByTitle.length > 0) {
      res.json(booksByTitle);
    } else {
      res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get book reviews based on ISBN
public_users.get("/review/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const reviews = await getBookReviews(isbn);
    if (reviews) {
      res.json(reviews);
    } else {
      res.status(404).json({ message: "Reviews not found for this book" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (users.find((user) => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

module.exports.general = public_users;
