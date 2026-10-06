const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  // Verificamos que se hayan proporcionado ambos campos
  if (username && password) {
    // Verificamos que el usuario no exista usando la función isValid
    if (!isValid(username)) { 
      // Si no existe, lo agregamos al arreglo global de usuarios
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  
  // Si falta alguno de los datos, mostramos el error
  return res.status(404).json({message: "Unable to register user. Username and/or password are required."});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      // Simulamos una operación asíncrona devolviendo una Promesa
      const getBooks = new Promise((resolve, reject) => {
          resolve(books);
      });
  
      // Esperamos a que la promesa se resuelva
      const bookList = await getBooks;
      
      return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
      return res.status(500).json({message: "Error retrieving books"});
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
      const isbn = req.params.isbn;
      
      // Simulamos una búsqueda asíncrona con una Promesa
      const getBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject(new Error("Book not found"));
        }
      });
  
      // Esperamos a que la promesa se resuelva
      const bookDetails = await getBook;
      return res.status(200).json(bookDetails);
      
    } catch (error) {
      return res.status(404).json({message: error.message});
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
      const author = req.params.author;
      
      // Simulamos la búsqueda asíncrona con una Promesa
      const getBooksByAuthor = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let booksByAuthor = [];
  
        for (let i = 0; i < bookKeys.length; i++) {
          let key = bookKeys[i];
          if (books[key].author === author) {
            booksByAuthor.push({
              isbn: key,
              title: books[key].title,
              reviews: books[key].reviews
            });
          }
        }
  
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject(new Error("No books found for this author"));
        }
      });
  
      // Esperamos a que la promesa se resuelva
      const result = await getBooksByAuthor;
      return res.status(200).json(result);
      
    } catch (error) {
      return res.status(404).json({message: error.message});
    }
  });

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
      const title = req.params.title;
      
      // Simulamos la búsqueda asíncrona encapsulando la lógica en una Promesa
      const getBooksByTitle = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        let booksByTitle = [];
  
        for (let i = 0; i < bookKeys.length; i++) {
          let key = bookKeys[i];
          if (books[key].title === title) {
            booksByTitle.push({
              isbn: key,
              author: books[key].author,
              reviews: books[key].reviews
            });
          }
        }
  
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error("No books found with this title"));
        }
      });
  
      // Esperamos a que la promesa se resuelva
      const result = await getBooksByTitle;
      return res.status(200).json(result);
      
    } catch (error) {
      return res.status(404).json({message: error.message});
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
      return res.status(200).json(books[isbn].reviews);
  } else {
      return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
