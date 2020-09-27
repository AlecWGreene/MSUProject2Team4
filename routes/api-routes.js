// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const isAuthenticated = require("../config/middleware/isAuthenticated.js");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea

    db.User.findOne({
      where: {
        id: req.user.id
      }
    })
      .then(dbUser => {
        res.json({
          username: dbUser.username,
          id: req.user.id
        });
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
      // lobbyID: req.body.lobby
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/api/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        username: req.user.username,
        id: req.user.id
      });
    }
  });

  // Route for deleting user account
  app.delete("/api/user_data/:id", (req, res) => {
    // var delUser = "id = " + req.params.id;

    db.User.destroy({
      where: {
        id: req.params.id
      }
    })
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        res.status(401).json(err);
      });
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

  app.put("/api/settings", isAuthenticated, (req, res) => {
    let data = {};
    if (req.body.action === "submit-change-username") {
      data = { username: req.body.input };
    } else if (req.body.action === "submit-change-password") {
      data = { password: req.body.input };
    } else {
      data = { email: req.body.input };
    }
    // Sending back a password, even a hashed password, isn't a good idea
    db.User.update(data, {
      where: {
        id: req.user.id
      }
    })
      .then(() => {
        res.json({
          data: data,
          id: req.user.id
        });
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // app.get("/api/lobby/join", (req, res) => {
  //   const renderPartial = {
  //     layout: "userPage",
  //     allPlayers: [],
  //     allLobbies: []
  //   };
  //   db.User.findAll({
  //     where: {
  //       status: true
  //     }
  //   })
  //     .then(dbUser => {
  //       for (let i = 0; i < dbUser.length; i++) {
  //         let select = false;
  //         if (dbUser[i].dataValues.id === parseInt(req.query.id)) {
  //           select = Boolean(req.query.select);
  //         }
  //         renderPartial.allPlayers.push(dbUser[i].dataValues);
  //         renderPartial.allPlayers[i].select = select;
  //       }
  //       db.Lobby.findAll()
  //         .then(dbLobby => {
  //           for (let i = 0; i < dbLobby.length; i++) {
  //             renderPartial.allLobbies.push(dbLobby[i].dataValues);
  //           }
  //           res.render("joinLobby", renderPartial);
  //         })
  //         .catch(err => {
  //           res.status(401).json(err);
  //         });
  //     })
  //     .catch(err => {
  //       res.status(401).json(err);
  //     });
  // });

  // app.post("/api/lobby/create", (req, res) => {
  //   db.Lobby.create({
  //     lobbyName: req.body.lobbyName,
  //     members: req.body.members,
  //     idHash: req.body.idHash
  //     // lobbyID: req.body.lobby
  //   })
  //     .then(() => {
  //       res.redirect(307, "/api/login");
  //     })
  //     .catch(err => {
  //       res.status(401).json(err);
  //     });
  // });
};
