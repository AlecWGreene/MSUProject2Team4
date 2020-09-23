// Dependencies
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");
const cors = require("cors");

// Setup port and initialize sequelize models
const PORT = process.env.PORT || 8080;
const db = require("./models");

// Setup express app with configurations
const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Set Handlebars.
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Integrate express-session and passport to allow the authentication middleware
app.use(session({ secret: "arthur", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Load our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Sync to the database then start the app
db.sequelize.sync().then(() => {
  const server = app.listen(PORT, () => {
    console.log("Avalon-Web-App is listening on port %s", PORT);
  });

  // Load the socket
  const socket = require("./config/socket")(server, passport, session);
  socket.on("error", message => {
    console.log(message);
  });
});
