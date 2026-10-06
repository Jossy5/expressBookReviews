const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  // Si encontramos al menos uno, devolvemos true (es válido/existe)
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  // Si encontramos una coincidencia, las credenciales son válidas
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }

  // Verificamos las credenciales usando la función que acabamos de completar
  if (authenticatedUser(username,password)) {
    // Generamos el token JWT. Usamos la misma clave secreta "access" que en index.js
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // Guardamos el token y el nombre de usuario en la sesión
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  // Verificamos si el libro existe
  if (books[isbn]) {
    // Agregamos o actualizamos la reseña del usuario en el objeto de reseñas del libro
    books[isbn].reviews[username] = review;
    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
  } else {
    return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
  
    if (books[isbn]) {
      // Usamos el operador delete de JavaScript para eliminar la propiedad del objeto
      delete books[isbn].reviews[username];
      return res.status(200).send(`Review for the ISBN ${isbn} posted by the user ${username} deleted.`);
    } else {
      return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
