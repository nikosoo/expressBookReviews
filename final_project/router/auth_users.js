const express = require("express");
const jwt = require("jsonwebtoken");
const books = require("./booksdb.js");
const regd_users = express.Router();

const JWT_SECRET = "your_jwt_secret"; // Use environment variables in production

let users = [];

// Check if the username is valid
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if the username and password match
const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const isbn = req.params.isbn;
  const { review, rating } = req.body;
  const username = req.user.username;

  if (!review || rating === undefined) {
    return res.status(400).json({ message: "Review and rating are required" });
  }

  const book = books.find((book) => book.ISBN === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews array if it doesn't exist
  if (!book.reviews) {
    book.reviews = [];
  }

  // Find if the review already exists for the user
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

// Delete a book review
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  const book = books.find((book) => book.ISBN === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const initialLength = book.reviews.length;
  book.reviews = book.reviews.filter((review) => review.reviewer !== username);

  if (book.reviews.length === initialLength) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  res.json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
