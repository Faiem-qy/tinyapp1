
function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
}

//5B. USER LOOKUP FUNCTION - Finding a user in the users object from its email
function getUserByEmail(email, users){
  //loop through the object using a for of loop
  for (const id in users) {
    //if email is equal to req.body.email
    if (users[id].email === email) {
      return users[id]; //return either the entire user object or null if not found.
    }
  }
  //else return null
  return undefined;
};

//make a function to check if the user id, which is in a nested object, if the user is the same then show the shortURLs

function checkUserId(id, urlDatabase) {
  let confirmedId = {};
  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {// in the database, check if the userId in each obj matches the provided user_id/cookie of the logged in user.
      // if it does, take the shortURL(eg. b2xVn2) as the key and website as the value and add it to the object
      confirmedId[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  return confirmedId;//eg result {b2xVn2: 'https://www.tsn.ca', b6UTxQ: 'https://www.f1.ca'}
}

function checkIdExists(id, urlDatabase) {// make function to iterate over urlDatabase to check if shortUrl exist
  for (const key in urlDatabase) {
    if (key === id) {
      return true;
    }
  }
  return false;
}


module.exports = {
  generateRandomString, checkIdExists, checkUserId, getUserByEmail
};