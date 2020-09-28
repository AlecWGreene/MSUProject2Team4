/* eslint-disable no-unused-vars */
// Dependencies
const db = require("../models/index.js");
const passport = require("../config/passport");
const codeGenerator = require("../config/lobbyCodeGenerator.js");
const isAuthenticated = require("../config/middleware/isAuthenticated.js");
const { Op: Op } = require("sequelize");

// Character set for lobby code generation
const charSet = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9"
];

module.exports = function(app, sessionManager) {
  async function getUserLobby(user) {
    // Return out if the user doesn't have a lobbyCode
    if (user.lobbyID === null) {
      return -3;
    }
    // Query db for lobby
    const lobby = await db.Lobby.findOne({
      where: {
        idhash: user.lobbyID
      }
    });
    const userModel = await db.Lobby.findOne({
      email: user.email
    });
    // Return out if the lobby doesn't exist
    if (!lobby) {
      return -2;
    }
    // Return out if the user isn't associated with the lobby
    else if (!lobby.userhash.split(",").includes(user.id.toString())) {
      return -1;
    }

    return lobby;
  }

  async function isLobbyHead(user) {
    // Get lobby and check user belongs to it
    const lobby = await getUserLobby(user);
    if (typeof lobby === "number") {
      return lobby;
    }

    if (lobby.creatorid === user.id) {
      return lobby;
    } else {
      return false;
    }
  }

  // POST /api/lobby/create -- creates a new lobby
  app.post("/api/lobby/create", isAuthenticated, (req, res, next) => {
    // Get user
    if (!req.user) {
      return res.status(403);
    }
    const user = req.user;

    // User must give a max party size
    if (!req.body.partySize) {
      return res.status(409).send("Lobby requires party size");
    }

    // Get all existing lobby codes
    db.Lobby.findAll({
      attributes: ["idhash"]
    }).then(data => {
      // Create a new lobby with the api caller as the head
      let set = data.map(model => model.idhash);
      if (set.length === 0) {
        set = ["00000000"];
      }
      const code = codeGenerator(set, charSet);
      db.Lobby.create({
        lobbyname: req.body.name ? req.body.name : `Lobby-${code}`,
        idhash: code,
        userhash: user.id.toString(),
        creatorid: user.id,
        maxusers: req.body.partySize,
        numusers: 1
      })
        .then(() => {
          // Redirect user to lobby page
          db.User.findOne({
            where: {
              email: user.email
            }
          }).then(userModel => {
            userModel.lobbyID = code;
            userModel.save().then(() => {
              res.status(202).json(code);
            });
          });
        })
        .catch(err => {
          // Send error and a 409 status
          return res.status(409).json(err);
        });
    });
  });

  // DELETE /api/lobby/delete -- deletes an existing lobby if it is NOT in game session
  app.delete("/api/lobby/delete", isAuthenticated, (req, res) => {
    // Get user
    if (!req.user) {
      return res.status(403);
    }
    const user = req.user;

    // Check that user is the lobby head
    isLobbyHead(user).then(result => {
      // Return out if an error code is the result
      if (typeof result === "number") {
        return res.status(401).send(result);
      }

      // Return out if the user is not the head
      if (!result) {
        return res.status(403);
      } else {
        db.Lobby.destroy({
          where: {
            idhash: user.lobbyCode
          }
        })
          .then(() => {
            res.status(200).json("/home");
          })
          .catch(err => {
            return res.status(409).json(err);
          });
      }
    });
  });

  // POST /api/lobby/join/ -- joins a lobby with the specified code
  app.post("/api/lobby/join/:lobbyCode", isAuthenticated, (req, res) => {
    // Get user
    if (!req.user) {
      return res.status(402);
    }
    const user = req.user;

    // Find the lobby
    db.Lobby.findOne({
      where: {
        idhash: req.params.lobbyCode
      }
    })
      .then(lobby => {
        if (lobby.maxusers <= lobby.numusers) {
          return res.status(406).send("Lobby is Full");
        }

        // Add user to hash
        const users = lobby.userhash.split(",");

        // If user is in the lobby already, redirect them
        if (users.includes(user.id)) {
          return res.status(202).redirect(`/lobby/${lobby.lobbyCode}`);
        }

        // Add user to lobby
        users.push(user.id);
        lobby.userhash = users.join(",");
        lobby.numusers++;

        // update database entry and redirect user
        lobby
          .save()
          .then(() => {
            // Update user lobby field
            db.User.findOne({
              where: {
                email: user.email
              }
            })
              .then(dbUser => {
                dbUser.lobbyID = lobby.idhash;
                dbUser
                  .save()
                  .then(() => {
                    // Continue to lobby screen
                    return res.status(202).json(lobby.idhash);
                  })
                  .catch(err => {
                    return res.status(403).json(err);
                  });
              })
              .catch(err => {
                return res.status(403).json(err);
              });
          })
          .catch(err => {
            return res.status(403).json(err);
          });
      })
      .catch(err => {
        // Send 403 status if no lobbies are found
        return res.status(403).json(err);
      });
  });

  // POST /api/lobby/leave/ -- leaves the current lobby the user is in
  app.post("/api/lobby/leave", isAuthenticated);

  // POST /api/lobby/start-game -- starts the game session if conditions are valid
  app.post("/api/lobby/start-game", isAuthenticated, (req, res) => {
    // Get user
    if (!req.user) {
      return res.status(402);
    }
    const user = req.user;

    isLobbyHead(user).then(lobby => {
      if (typeof lobby === "number") {
        return res.status(403).json(lobby);
      }

      // Check all users are ready
      const readyUsers = lobby.numReady ? lobby.numReady : [];
      for (const u of lobby.userhash.split(",")) {
        if (!readyUsers.includes(u)) {
          return res.status(406).json("User's aren't ready");
        }
      }

      // Indicate game is ready to launch
      lobby.ingame = true;
      lobby
        .save()
        .then(() => {
          return res.status(202).json("Game Started");
        })
        .catch(err => {
          return res.status(403).json(err);
        });
    });
  });

  // GET /api/lobby/data
  app.get("/api/lobby/data", isAuthenticated, (req, res) => {
    // Get user
    if (!req.user) {
      return res.status(402);
    }
    const user = req.user;

    getUserLobby(user)
      .then(lobby => {
        // Lobbies aren't numbers
        if (typeof lobby === "number") {
          return res.status(403).json(lobby);
        }

        // Get all user info in lobby if game isn't ready to start
        db.User.findAll({
          where: {
            id: {
              // Check if id is in lobby's userhash
              [Op.in]: lobby.userhash.split(",").map(string => Number(string))
            }
          }
        })
          .then(users => {
            // Check if game is ready to start, then register the session with the sessionManager and redirect the users
            if (lobby.ingame && lobby.numready === lobby.numusers) {
              const settings = req.body.settings ? req.body.settings : {};
              sessionManager.createSession(users, settings);
              return res.status(202).redirect("/game");
            } else {
              // If numReady is null returnData
              if (!lobby.numReady) {
                const returnData = {
                  name: lobby.lobbyname,
                  code: lobby.idhash,
                  numReady: [],
                  lobbyReady: lobby.ingame,
                  maxUsers: lobby.maxusers,
                  // User object passed to people in lobby
                  users: users.map(person => {
                    return {
                      id: person.id,
                      username: person.username
                    };
                  })
                };

                return res.status(202).json(returnData);
              }

              // If numReady is not null then getReady tally
              db.User.findAll({
                where: {
                  id: {
                    [Op.in]: lobby.numReady.split(",").map(str => Number(str))
                  }
                }
              })
                .then(readyList => {
                  const returnData = {
                    name: lobby.lobbyname,
                    code: lobby.idhash,
                    numReady: readyList.map(person => {
                      return {
                        id: person.id,
                        username: person.username
                      };
                    }),
                    lobbyReady: lobby.ingame,
                    maxUsers: lobby.maxusers,
                    // User object passed to people in lobby
                    users: users.map(person => {
                      return {
                        id: person.id,
                        username: person.username
                      };
                    })
                  };

                  return res.status(202).json(returnData);
                })
                .catch(err => res.status(400).json(err));
            }
          })
          .catch(err => {
            return res.status(404).json(err);
          });
      })
      .catch(err => {
        return res.status(403).json(err);
      });
  });

  // POST /api/lobby/ready-up
  app.post("/api/lobby/ready-up", isAuthenticated, (req, res) => {
    // Get user
    if (!req.user) {
      return res.status(402);
    }
    const user = req.user;

    getUserLobby(user)
      .then(lobby => {
        // Lobbies aren't numbers
        if (typeof lobby === "number") {
          return res.status(403).json(lobby);
        }

        db.User.findAll({
          where: {
            id: {
              [Op.in]: !lobby.numReady
                ? []
                : lobby.numReady.split(",").map(str => Number(str))
            }
          }
        })
          .then(readyUsers => {
            // Toggle user inclusion in readyUsers
            let toggleOn;
            const newReadyUsers = readyUsers;
            if (readyUsers.includes(user.id)) {
              toggleOn = false;
              newReadyUsers.splice(readyUsers.indexOf(user.id), 1);
            } else {
              toggleOn = true;
              newReadyUsers.push(user.id);
            }

            // Update lobby value
            lobby.numReady = newReadyUsers.join(",");
            lobby
              .save()
              .then(() => {
                res.status(200).json(toggleOn.toString());
              })
              .catch(err => res.status(502).json(err));
          })
          .catch(err => {
            res.status(404).json(err);
          });
      })
      .catch(err => {
        return res.status(400).json("Error from getUserLobby.catch 352");
      });
  });
};
