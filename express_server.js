const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

//1A. DISPLAYING USERNAME WITH COOKIE-PARSER
app.use(cookieParser());

// Define the initial database of shortened URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//4A. REGISTERING NEW USERS
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123",
  },
};

// Route to redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const id = req.params.id;
  const longURL = urlDatabase[id]; //Retrieve the longURL using the id from urlDatabase
  
  if (longURL) {
    console.log("true")
    res.redirect(longURL); //Redirect to the longURL
  } else {
    console.log("false")
    res.status(404).send("Short URL not found");
  }
});

// Route to render the form for creating new URLs
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    user_id, //1C. DISPLAYING USERNAME WITH COOKIE-PARSER //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    user: users[user_id] //4D. Passing the user Object to the _header
  };
  if(!user_id){
    res.render("login", templateVars); //If the user is not logged in, redirect GET /urls/new to GET /login
  }else{
  res.render("urls_new", templateVars);
  }
});
//If the user is not logged in, redirect GET /urls/new to GET /login

// Route to display a specific short URL's details
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies.user_id
  const longURL = urlDatabase[id];
  const templateVars = {
    id,
    longURL,
    user: users[user_id], //4D. Passing the user Object to the _header
    user_id //1D. DISPLAYING USERNAME WITH COOKIE-PARSER //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
  };
  res.render("urls_show", templateVars);
});

// Route to display a list of all short URLs
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id
  const templateVars = {
    user_id, //1B. DISPLAYING USERNAME WITH COOKIE-PARSER //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    urls: urlDatabase,
    user: users[user_id] //4D. Passing the user Object to the _header
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});// crash

//3A. USER REGISTRATION FORM
app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id
  const templateVars = {
    user_id, //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    urls: urlDatabase,
    user: users[user_id] //4D. Passing the user Object to the _header
  };
  if(!user_id){
    res.render("registration", templateVars);
  }else{
    res.redirect("/urls"); //If the user is logged in, GET /register should redirect to GET /urls
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//6C . Add a GET route /login that renders the appropriate template
app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    user_id, 
    user: users[user_id]
  };
  if(!user_id){
    res.render("login", templateVars);
  }else{
    res.redirect("/urls"); //If the user is logged in, GET /login should redirect to GET /urls
  }
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();// generate random string
  const longURL = req.body.longURL;//
  console.log(id, longURL); // Log the POST request body to the console
  urlDatabase[id] = longURL;// add random id to the new longUrl
  console.log(urlDatabase);

  if(!user_id){
    return res.send("You need to register to create URL's"); //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs
  }else{
    res.redirect("/urls"); //If the user is logged in, GET /register should redirect to GET /urls
    res.send("Ok"); // Respond with 'Ok' (we will replace this)
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id; // Get the ID to delete from the route parameter
  if (urlDatabase[idToDelete]) {
    delete urlDatabase[idToDelete]; // Remove the URL from the database
    res.redirect("/urls");// Redirect back to the index page
  } else {
    res.status(404).send("Short URL not found");
  }
});

// NEW UPDATING URLS - Make Edit Button Work
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the ID
  const longURL = req.body.longURL;

  urlDatabase[id] = longURL;  //The id is assigned a new value. This id is now equal to this new req.body submitted by the user (old one is discarded)
  res.redirect("/urls");
});


// //6A. Update Login Handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email)
  // console.log(user)

  if (email === '' || password === '') { //If empty strings, send back a response with the 400 status code
    return res.status(400).send("Error 400 -To Login Please provide valid email and/or password"); 
  } else if (!user) { //If a user with that e-mail cannot be found, return a response with a 403 status code
    return res.status(403).send("Error 403 -User/Email does not exist"); 
  } else if (user.password !== password) {
    return res.status(403).send("Error 403 - Please check your login Information and try again"); 
  } else { //If email exists, set cookie to the user_id
    res.cookie('user_id', user.id);
  }
  res.redirect("/urls");
});

//2A. LOGOUT AND CLEAR COOKIES
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
  res.redirect("/login"); //6B. Update the /logout reroute to send the user to our /login page.
});

//4B. REGISTERING NEW USERS
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  //5A. Handle Registration Errors
  if (email === '' || password === '') { //If empty strings, send back a response with the 400 status code
    return res.status(400).send("Error 400 - Please provide valid email and/or password"); 
  } else if (getUserByEmail(email)) { //If registering with email already in the users obj-> 400 status code
    return res.status(400).send("Error 400 - Email already exists");
  } else {
    users[id] = { id, email, password };
    res.cookie('user_id', users[id].id);

  }
  users[id] = { id, email, password };
  res.cookie('user_id', users[id].id);  //4B. After adding the user, set a user_id cookie containing  //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookiethe user's newly generated ID.
  console.log(users);
  res.redirect("/urls");
});

//5B. USER LOOKUP FUNCTION - Finding a user in the users object from its email
const getUserByEmail = (email) => {
  //loop through the object using a for of loop
  for (const id in users) {
    //if email is equal to req.body.email
    if (users[id].email === email) {
      return users[id]; //return either the entire user object or null if not found.
    }
  }
  //else return null
  return null;
};