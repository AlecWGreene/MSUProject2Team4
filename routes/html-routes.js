// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  app.get("/", (req, res) => {
    // If the user already has an account send them to user home page.
    if (req.user) {
      res.redirect("/home");
    }
    // render rules page if not yet logged in.
    res.render("homepage");
  });

  app.get("/login", (req, res) => {
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/home");
    }
    // res.sendFile(path.join(__dirname, "../public/login.html"));
    res.render("login");
  });

  app.get("/signup", (req, res) => {
    // If the user already has an account send them to the members page
    if (req.user) {
      res.redirect("/home");
    }
    // res.sendFile(path.join(__dirname, "../public/login.html"));
    res.render("signup");
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/home", isAuthenticated, (req, res) => {
    res.render("homepage", { layout: "userPage" });
  });

  // Render games page
  app.get("/games", isAuthenticated, (req, res) => {
    res.render("games", { layout: "userPage" });
  });

  // Render create lobby page
  app.get("/lobby/create", isAuthenticated, (req, res) => {
    res.render("createLobby", { layout: "userPage" });
  });

  // Render join lobby page
  app.get("/lobby/join", isAuthenticated, (req, res) => {
    res.render("joinLobby", { layout: "userPage" });
  });
};
