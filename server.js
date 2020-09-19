// Dependencies
const express = require("express");
const session = require("express-session");
const passport = require("./config/passport");

// Setup port and initialize sequelize models
const PORT = process.env.PORT || 8080;
const db = require("./models");

// Setup express app with configurations
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Integrate express-session and passport to allow the authentication middleware
app.use(session({ secret: "arthur", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Load our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Setup http server for socket
const http = require("http").createServer(app);

// Load the socket
const socket = require("./config/socket")(http, passport, session);
socket.on("error", message => {
  console.log(message);
});

// Sync to the database then start the app
db.sequelize.sync().then(() => {
  http.listen(PORT, () => {
    console.log("Avalon-Web-App is listening on port %s", PORT);
  });
});
