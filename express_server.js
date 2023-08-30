const { generateRandomString, checkIdExists, checkUserId, getUserByEmail } = require('./helpers');

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
// const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

//1A. DISPLAYING USERNAME WITH COOKIE-PARSER
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Define the initial database of shortened URLs
const urlDatabase = {
  b2xVn2: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
  },
  b6UTxQ: {
    longURL: "https://www.f1.ca",
    userID: "user2RandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
  },
};

//4A. REGISTERING NEW USERS
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("123", 10)// edit to use the bcrypt feature to hash the stored password
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};

// Route to redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    res.status(404).send("Short URL not found");
  } else {
    const longURL = urlDatabase[id].longURL;
    res.redirect(longURL); //Redirect to the longURL
  }
});

// Route to render the form for creating new URLs
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user_id, //1C. DISPLAYING USERNAME WITH COOKIE-PARSER //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    user: users[user_id] //4D. Passing the user Object to the _header
  };
  if (!user_id) {
    res.render("login", templateVars); //If the user is not logged in, redirect GET /urls/new to GET /login
  } else {
    res.render("urls_new", templateVars);
  }
});
//If the user is not logged in, redirect GET /urls/new to GET /login

// Route to display a specific short URL's details
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  // const longURL = urlDatabase[id].longURL;
  const urlsForUser = checkUserId(user_id, urlDatabase);
  if (!user_id) {//if user is not logged in, prompt login
    res.send(`
    <html>
      <body>
        <p>Please log in to continue updating URL's</p>
        <form method="GET" action="/login">
          <button type="submit" class="btn btn-primary btn-sm"> Log In </button>
        </form>
      </body>
    </html>`);
  } else if (!checkIdExists(id, urlDatabase)) {//if this shortUrl does not exist prompt 
    res.send("<html><body><p>URL does not exist</p></body></html>\n");
  } else if (!urlsForUser[id]) {//check filtered obj for shortUrl that user is attempting to access
    res.send("<html><body><p>You dont own this URL</p></body></html>\n");
  } else {
    const templateVars = {
      id,
      longURL: urlDatabase[id].longURL,
      user: users[user_id], //4D. Passing the user Object to the _header
      user_id //1D. DISPLAYING USERNAME WITH COOKIE-PARSER //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    };
    res.render("urls_show", templateVars);
  }
});

// Route to display a list of all short URLs
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user_id, //1B. DISPLAYING USERNAME WITH COOKIE-PARSER //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    urls: checkUserId(user_id, urlDatabase),//compare cookie to user
    user: users[user_id] //4D. Passing the user Object to the _header
  };
  if (!user_id) {
    res.send(`
    <html>
      <body>
        <p>Please log in to continue</p>
        <form method="GET" action="/login">
          <button type="submit" class="btn btn-primary btn-sm"> Log In </button>
        </form>
      </body>
    </html>`);
  } else {

    // res.redirect("/urls"); //If the user is logged in, GET /register should redirect to GET /urls
    res.render("urls_index", templateVars);
  }
});

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user_id,
    user: users[user_id]
  };
  if (!user_id) {
    res.render("login", templateVars);
  } else {
    res.redirect("/urls"); 
  }
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
  const user_id = req.session.user_id;
  const templateVars = {
    user_id, //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
    urls: urlDatabase,
    user: users[user_id] //4D. Passing the user Object to the _header
  };
  if (!user_id) {
    res.render("registration", templateVars);
  } else {
    res.redirect("/urls"); //If the user is logged in, GET /register should redirect to GET /urls
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//6C . Add a GET route /login that renders the appropriate template
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    user_id,
    user: users[user_id]
  };
  if (!user_id) {
    res.render("login", templateVars);
  } else {
    res.redirect("/urls"); //If the user is logged in, GET /login should redirect to GET /urls
  }
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();// generate random string
  const longURL = req.body.longURL;//
  const user_id = req.session.user_id;
  urlDatabase[id] = { "longURL": longURL, "userID": user_id };
  
  if (!user_id) {
    return res.send("You need to register to create URL's"); //If the user is not logged in, POST /urls should respond with an HTML message that tells the user why they cannot shorten URLs
  } else {
    res.redirect("/urls"); //If the user is logged in, GET /register should redirect to GET /urls
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;
  const urlsForUser = checkUserId(user_id, urlDatabase);
  if (!user_id) {// if user is not logged in then prompt the user to login
    res.send(`
    <html>
      <body>
        <p>Please log in to delete URL's</p>
        <form method="GET" action="/login">
          <button type="submit" class="btn btn-primary btn-sm"> Log In </button>
        </form>
      </body>
    </html>`);
  } else if (!checkIdExists(id, urlDatabase)) {// if short URL does not exist then prompt
    res.send("<html><body><p>URL does not exist</p></body></html>\n");
  } else if (!urlsForUser[id]) {// if the user does not own the URL then prompt 
    res.send("<html><body><p>You dont own this URL</p></body></html>\n");
  } else if (urlDatabase[id]) {
    delete urlDatabase[id]; // Remove the URL from the database
    res.redirect("/urls");// Redirect back to the index page
  }
});

// NEW UPDATING URLS - Make Edit Button Work
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the ID
  const longURL = req.body.longURL;

  urlDatabase[id].longURL = longURL;  //The id is assigned a new value. This id is now equal to this new req.body submitted by the user (old one is discarded)
  res.redirect("/urls");
});


// //6A. Update Login Handler
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);//the user enters this password when logging in which is hashed 
  const user = getUserByEmail(email, users);// this uses the email provided to filter through the users obj and return the specific user

  if (email === '' || password === '') { //If empty strings, send back a response with the 400 status code
    return res.status(400).send("Error 400 -To Login Please provide valid email and/or password");
  } else if (!user) { //If a user with that e-mail cannot be found, return a response with a 403 status code
    return res.status(403).send("Error 403 -User/Email does not exist");
  } else if (bcrypt.compareSync(password, user.password)) {// this compres the password provided by the user to the stored password in the users object
    return res.status(403).send("Error 403 - Please check your login Information and try again");
  } else { //If email exists, set cookie to the user_id
    req.session.user_id = user.id;
  }
  res.redirect("/urls");
});

//2A. LOGOUT AND CLEAR COOKIES
app.post("/logout", (req, res) => {
  req.session = null; //4C. we're no longer going to set a username cookie; instead, we will set only a user_id cookie
  res.redirect("/login"); //6B. Update the /logout reroute to send the user to our /login page.
});

//4B. REGISTERING NEW USERS
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);

  //5A. Handle Registration Errors
  if (email === '' || password === '') { //If empty strings, send back a response with the 400 status code
    return res.status(400).send("Error 400 - Please provide valid email and/or password");
  } else if (getUserByEmail(email, users)) { //If registering with email already in the users obj-> 400 status code
    return res.status(400).send("Error 400 - Email already exists");
  } else {
    users[id] = { id, email, password };
    req.session.user_id = users[id].id;
  }

  res.redirect("/urls");
});

