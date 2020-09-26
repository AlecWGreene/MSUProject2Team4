/* eslint-disable no-empty-function */
/* eslint-disable no-unused-vars */
const db = require("../models");
const passport = require("../config/passport");
const { GameState } = require("../config/gameSession");

module.exports = function(app, sessionManager) {
  // GET Route -- game/run
  app.get(
    "/api/game/:lobbyCode/run",
    passport.authenticate("local"),
    (req, res) => {
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
        sessionManager.createSession(lobbyCode, customSettings);
      }

      return res.status(202).send(true);
    }
  );

  // POST Route -- game/validVote
  app.post(
    "/api/game/:lobbyCode/validVote",
    passport.authenticate("local"),
    (req, res) => {
      if (!req.body.vote || Math.abs(req.body.vote) !== 1) {
        return res.status(403);
      }

      const currentSession =
        sessionManager.sessionDictionary[req.params.lobbyCode];
      const currentUser = req.user;
      currentSession.setUserVote_ValidParty(currentUser, req.body.vote);
    }
  );

  // POST Route -- game/passVote
  app.post(
    "/api/game/:lobbyCode/passVote",
    passport.authenticate("local"),
    (req, res) => {
      if (!req.body.vote || Math.abs(req.body.vote) !== 1) {
        return res.status(403);
      }

      const currentSession =
        sessionManager.sessionDictionary[req.params.lobbyCode];
      const currentUser = req.user;
      currentSession.setUserVote_PassParty(currentUser, req.body.vote);
      res.json(new GameState(currentSession).getPhaseInfo());
    }
  );

  // POST Route -- game/partySelection
  app.post("/api/game/:lobbyCode/partySelection", (req, res) => {
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
  });

  // GET Route -- game/state
  app.get(
    "/api/game/:lobbyCode/state",
    passport.authenticate("local"),
    (req, res) => {
      const cache = req.body.state;
      const currentSession =
        sessionManager.sessionDictionary[req.params.lobbyCode];
      if (currentSession.stateCacheNeedsUpdate(cache)) {
        return res
          .status(202)
          .json(new GAmeState(currentSession).getPhaseInfo());
      }

      return res.status(202).send(false);
    }
  );

  // GET Route -- game/users
  app.get(
    "/api/game/:lobbyCode/users",
    passport.authenticate("local"),
    (req, res) => {
      const currentSession =
        sessionManager.sessionDictionary[req.params.lobbyCode];
      res.json(currentSession.users);
    }
  );
};
