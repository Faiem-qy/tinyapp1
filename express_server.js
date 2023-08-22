const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

// Define the initial database of shortened URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Route to redirect short URLs to their corresponding long URLs
app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const id = req.params.id;
  const longURL = urlDatabase[id]; //Retrieve the longURL using the id from urlDatabase
  if (longURL) {
    res.redirect(longURL); //Redirect to the longURL
  } else {
    res.status(404).send("Short URL not found");
  }
});


// Route to render the form for creating new URLs
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Route to display a specific short URL's details
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

// Route to display a list of all short URLs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.post("/urls", (req, res) => {
  const id = generateRandomString();// generate random string
  const longURL = req.body.longURL;//
  console.log(id, longURL); // Log the POST request body to the console
  urlDatabase[id] = longURL;// add random id to the new longUrl
  console.log(urlDatabase);

  res.send("Ok"); // Respond with 'Ok' (we will replace this)
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

// NEW UPDATING URLS - Make Edit Button Work - start
app.post("/urls/:id", (req, res) => {
  const id = req.params.id; // Get the ID
  const longURL = req.body.longURL;

  urlDatabase[id] = longURL;  //The id is assigned a new value. This id is now equal to this new req.body submitted by the user (old one is discarded)
    res.redirect("/urls");
});
// Make Edit button work - end