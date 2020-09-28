/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const db = require("../models");
const passport = require("../config/passport");
const { GameState } = require("../config/gameSession");
const { Op: Op } = require("sequelize");
const isAuthenticated = require("../config/middleware/isAuthenticated.js");

module.exports = function(app, sessionManager) {
  // GET Route -- game/run
  app.get("/api/game/:lobbyCode/run", isAuthenticated, (req, res) => {
    // If session isn't created then create session
    if (
      !sessionManager.sessionDictionary[req.params.lobbyCode] ||
      Object.keys(sessionManager.sessionDictionary[req.params.lobbyCode])
        .length === 0
    ) {
      let customSettings = {};
      if (req.body.customSettings) {
        customSettings = req.body.customSettings;
      }

      // Load the lobby's users
      db.Lobby.findOne({
        where: { idhash: req.params.lobbyCode }
      })
        .then(lobby => {
          db.User.findAll({
            where: {
              id: {
                [Op.in]: lobby.userhash.split(",").map(id => Number(id))
              }
            }
          })
            .then(userArray => {
              sessionManager.createSession(
                req.params.lobbyCode,
                userArray,
                customSettings
              );
              const session =
                sessionManager.sessionDictionary[req.params.lobbyCode];
              const initState = new GameState(session);
              db.User.findOne({
                where: {
                  email: req.user.email
                }
              })
                .then(reqUser => {
                  session.revealCharacterInfo();
                  return res.json(
                    initState.getRevealInfo(session.roleAssignments[reqUser.id])
                  );
                })
                .catch(err => {
                  console.log("Error: " + JSON.stringify(err));
                  res.json(err);
                });
            })
            .catch(err => {
              console.log("Error: " + JSON.stringify(err));
              res.json(err);
            });
        })
        .catch(err => {
          console.log("Error: " + JSON.stringify(err));
          res.json(err);
        });
    }
    // If lobby already exists
    else {
      // Get ssion and state
      const session = sessionManager.sessionDictionary[req.params.lobbyCode];
      const initState = new GameState(session);
      db.User.findOne({
        where: {
          email: req.user.email
        }
      })
        .then(reqUser => {
          session.revealCharacterInfo();
          return res.json(
            initState.getRevealInfo(session.roleAssignments[reqUser.id])
          );
        })
        .catch(err => {
          console.log("Error: " + JSON.stringify(err));
          res.json(err);
        });
    }
  });

  // POST Route -- game/validVote
  app.post("/api/game/:lobbyCode/validVote", isAuthenticated, (req, res) => {
    if (!req.body.vote || Math.abs(req.body.vote) !== 1) {
      return res.status(403);
    }

    const currentSession =
      sessionManager.sessionDictionary[req.params.lobbyCode];
    const currentUser = req.user;
    currentSession.setUserVote_ValidParty(currentUser, req.body.vote);
  });

  // POST Route -- game/passVote
  app.post("/api/game/:lobbyCode/passVote", isAuthenticated, (req, res) => {
    if (!req.body.vote || Math.abs(req.body.vote) !== 1) {
      return res.status(403);
    }

    const currentSession =
      sessionManager.sessionDictionary[req.params.lobbyCode];
    const currentUser = req.user;
    currentSession.setUserVote_PassParty(currentUser, req.body.vote);
    res.json(new GameState(currentSession).getPhaseInfo());
  });

  // POST Route -- game/partySelection
  app.post(
    "/api/game/:lobbyCode/partySelection",
    isAuthenticated,
    (req, res) => {
      // If no user array is passed
      if (!req.body.userArray) {
        res.status(402);
      }

      const currentSession =
        sessionManager.sessionDictionary[req.params.lobbyCode];
      const userArray = Array.from(currentSession.users);
      // eslint-disable-next-line prettier/prettier
      const partyArray = userArray.filter(user => req.body.userArray.includes(user.id) );
      currentSession.setPartySelection(partyArray);
      res.json(new GameState(currentSession).getPhaseInfo());
    }
  );

  // GET Route -- game/state
  app.post("/api/game/:lobbyCode/state", isAuthenticated, (req, res) => {
    const cache = req.body.cache;
    const currentSession =
      sessionManager.sessionDictionary[req.params.lobbyCode];
    console.log("Comparing States");
    //console.log(new GameState(currentSession).getPhaseInfo(req.user));
    console.log(req.body);
    console.log("-----------------------------------------------");
    if (!cache) {
      return res
        .status(202)
        .json(new GameState(currentSession).getPhaseInfo(req.user));
    } else if (currentSession.stateCacheNeedsUpdate(cache)) {
      return res
        .status(202)
        .json(new GameState(currentSession).getPhaseInfo(req.user));
    }

    return res.status(202).json("Up to date");
  });

  // GET Route -- game/users
  app.get("/api/game/:lobbyCode/users", isAuthenticated, (req, res) => {
    const currentSession =
      sessionManager.sessionDictionary[req.params.lobbyCode];
    res.json(currentSession.users);
  });
};
