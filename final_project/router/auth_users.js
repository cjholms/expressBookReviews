const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    //write code to check is the username is valid
}

// Check if the user with the given username and password exists
const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let loggedInUser = req.session.authorization['username'];
    let book = books[parseInt(req.params.isbn)];
    let review = req.query.review;
    let numberOfReviews = Object.keys(book.reviews).length;
    let newEntry = numberOfReviews + 1;
    let userFound = false;

    // loop through the reviews to see if the user has already made a review
    Object.keys(book.reviews).forEach((entry) => {
        if (book.reviews[parseInt(entry)].user === loggedInUser) {
            // replace the existing review with the current review
            book.reviews[parseInt(entry)].text = review;
            userFound = true;
            return res.status(200).json({ message: "Review updated" });
        }
    });

    // if the user was not found, then this is a new entry to add
    if (!userFound) {
        let newReview = { "user": loggedInUser, "text": review };
        Object.assign(book.reviews, { [newEntry]: newReview });

        return res.status(200).json({ message: "Review added" });
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
