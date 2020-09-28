// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../config/middleware/isAuthenticated");
const db = require("../models");

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

  app.get("/settings", isAuthenticated, (req, res) => {
    res.render("settings", { layout: "userPage" });
  });

  // Render games page
  app.get("/game", isAuthenticated, (req, res) => {
    res.render("games", { layout: "gameNav" });
  });

  // Render active lobby waiting room
  app.get("/lobby/wait", isAuthenticated, (req, res) => {
    res.render("activeLobby", { layout: "userPage" });
  });

  // Render join lobby page
  app.get("/lobby/join", isAuthenticated, (req, res) => {
    if (req.user.lobbyID) {
      res.redirect("../game");
    }
    res.render("joinLobby", { layout: "userPage" });
  });

  app.get("/lobby/create", (req, res) => {
    const renderPartial = {
      layout: "userPage",
      allPlayers: [],
      allLobbies: []
    };
    db.User.findAll({
      where: {
        status: true
      }
    })
      .then(dbUser => {
        for (let i = 0; i < dbUser.length; i++) {
          let select = false;
          if (dbUser[i].dataValues.id === parseInt(req.query.id)) {
            select = Boolean(req.query.select);
          }
          renderPartial.allPlayers.push(dbUser[i].dataValues);
          renderPartial.allPlayers[i].select = select;
        }
        db.Lobby.findAll()
          .then(dbLobby => {
            for (let i = 0; i < dbLobby.length; i++) {
              renderPartial.allLobbies.push(dbLobby[i].dataValues);
            }
            res.render("createLobby", renderPartial);
          })
          .catch(err => {
            res.status(401).json(err);
          });
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });
};
