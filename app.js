//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDBB', { useNewUrlParser: true });
  
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

// Creating the schema
const userSchema = new mongoose.Schema({ 
  email: String, 
  password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET_STR, excludeFromEncryption: ['password']});

// Creating a model that we can work with
const UserData = new mongoose.model('UserData', userSchema);

const app = express();


// using body-parser
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// app.get("/", (request,response) => {response.send("<h1>Hello World!</h1>")})

app.listen(process.env.SECRET_PORT, () => {console.log(`The app is running at door ${process.env.SECRET_PORT} successfully.`)})

app.get("/", (req, res) => {
  res.render("home.ejs")
} )

app.get("/register", (req, res) => {
  res.render("register.ejs")
} )

app.get("/login", (req, res) => {
  res.render("login.ejs")
} )

app.post("/register", (req, res) => {
  // console.log(req.body.username)
  // console.log(req.body.password)
  // now just register username and password to mongo db data base using the save method
  const randomUser = new UserData({email: req.body.username, password: req.body.password});
  
  randomUser.save(err => {
    if (err) {
      console.log(err.message);
      res.send("<h1>Not working...</h1>");
    } else if (randomUser.email != "" && randomUser.password != ""){
      console.log(`The document ${randomUser} has been added successfully.`);
      res.render("secrets.ejs");
    } else if (randomUser.email == "" && randomUser.password != "") {
      res.send("<h1>You should populate the email input.</h1>");
    } else if (randomUser.email != "" && randomUser.password == "") {
      res.send("<h1>You should populate the password input.</h1>");
    } else if (randomUser.email == "" && randomUser.password == "") {
      res.send("<h1>You should populate both email and password input.</h1>");
    }
  });
  
});

app.post("/login", (req, res) => {
  
  UserData.find({email: req.body.username}, (err, data) => {
    if (err) {
      console.log(err);
      res.send("<h1>You wont see the page!</h1>");
    } else {
      if (data) {
        if (data.password == req.body.password) {
          res.render("submit.ejs");
        } else {
          res.send(`<h1>data.password = ${data.password}\nand req.body.password = ${req.body.password}</h1>`)
        }
      } else {
        res.send("<h1>Your password is incorrect. Try again. </h1>")
      }
    }
  });

})