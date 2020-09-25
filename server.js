// Dependencies
const express = require("express");
const session = require("express-session");
const handlebars = require("express-handlebars");
const passport = require("./config/passport");
const cors = require("cors");

// Setup port and initialize sequelize models
const PORT = process.env.PORT || 8080;
const db = require("./models");

// Setup session middleware
const sessionMiddleware = session({
  name: "Avalon App User",
  secret: "Scorpion Samurai",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1500000
  }
});

// Setup express app with configurations
const app = express();
app.use(cors());
app.options("*", cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Integrate express-session and passport to allow the authentication middleware
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Setup handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Load our routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);
require("./routes/api-game-routes")(app, require("./config/sessionManager"));

// Sync to the database then start the app
db.sequelize.sync().then(() => {
  const server = app.listen(PORT, () => {
    console.log("Avalon-Web-App is listening on port %s", PORT);
  });

  // Load the socket
  const socket = require("./config/socket")(server, sessionMiddleware);
  socket.on("error", message => {
    console.log(message);
  });
});
