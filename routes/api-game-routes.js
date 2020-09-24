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
    sessionManager.createSession(req.params.lobbyCode, {});

    // If no user array is passed
    if (!req.body.userArray) {
      res.status(402);
    }

    console.dir(sessionManager);
    const currentSession =
      sessionManager.sessionDictionary[req.params.lobbyCode];
    const userArray = Array.from(currentSession.users);
    // eslint-disable-next-line prettier/prettier
    const partyArray = userArray.filter(user => req.body.userArray.includes(user.id) );
    currentSession.setPartySelection(partyArray);
    console.dir(sessionManager.sessionDictionary.aaaa.candidateParty);
    setInterval(() => {
      console.clear();
      console.log("Game State:");
      console.dir(sessionManager.sessionDictionary.aaaa);
    }, 10000);
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
