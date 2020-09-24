const db = require("../models");
const passport = require("../config/passport");

module.exports = function(app, sessionManager: SessionManager) {
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
  app.post(
    "/api/game/:lobbyCode/partySelection",
    passport.authenticate("local"),
    (req, res) => {
        // If no user array is passed
        if(!req.body.userArray){
            res.status(402);
        }

        // Return party selection
        // let sessionManager.sessionDirectory[req.params.lobbyCode].users;
        res.json(req.body.userArray);
    }
  );

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
