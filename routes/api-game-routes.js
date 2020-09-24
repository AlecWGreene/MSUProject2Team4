/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const db = require("../models");
const passport = require("../config/passport");

module.exports = function(app, sessionManager) {
  // GET Route -- game/run
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // POST Route -- game/validVote
  app.post(
    "/api/game/:lobbyCode/validVote",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // POST Route -- game/passVote
  app.get(
    "/api/game/:lobbyCode/passVote",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // POST Route -- game/partySelection
  app.post("/api/game/:lobbyCode/partySelection", (req, res) => {
    // If no user array is passed
    if (!req.body.userArray) {
      res.status(402);
    }

    // Send party selection
    // let currentSession = sessionManager.sessionDirectory[req.params.lobbyCode];
    // let userArray = Array.from(currentSession.users);
    // let partyArray = userArray.filter(user => req.body.userArray.includes(user.id));
    // currentSession.setPartySelection(partyArray);
    res.json(req.body.userArray);
  });

  // GET Route -- game/state
  app.get(
    "/api/game/:lobbyCode/state",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // GET Route -- game/users
  app.get(
    "/api/game/:lobbyCode/users",
    passport.authenticate("local"),
    (req, res) => {}
  );
};
