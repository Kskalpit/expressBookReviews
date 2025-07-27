const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Create JWT token
        const accessToken = jwt.sign({ data: username }, 'access', { expiresIn: 60 * 60 });

        // Save token to session
        req.session.authorization = {
            accessToken
        };

        return res.status(200).json({ message: "User logged in successfully." });
    } else {
        return res.status(401).json({ message: "Invalid login. Check username or password." });
    }
});


regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check if book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found with the given ISBN." });
    }

    // Check if review is provided
    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required." });
    }

    // Get username from JWT session
    const username = req.user.data; 

    // Add or update the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check if book with the ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found with the given ISBN." });
    }

    const username = req.user.data; // Username stored in JWT session

    // Check if review by this user exists
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
    } else {
        return res.status(404).json({ message: "No review found for this user on the given book." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
