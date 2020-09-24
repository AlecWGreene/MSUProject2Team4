const db = require("../models");
const passport = require("../config/passport");

module.exports = function(app) {
  // GET Route -- game/run
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // POST Route -- game/validVote
  app.post(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // POST Route -- game/passVote
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // POST Route -- game/partySelection
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // GET Route -- game/state
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );

  // GET Route -- game/users
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {}
  );
};
