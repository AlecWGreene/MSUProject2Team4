const { GameSession: GameSession } = require("./gameSession.js");
const db = require("../models/index.js");

class SessionManager {
  static createSession(lobbyCode, customSettings) {
    // Register new session
    this.sessionDictionary[lobbyCode] = new GameSession(
      lobbyCode,
      customSettings
    );

    db.Lobby.findOne({
      where: {
        IdHash: lobbyCode
      }
    });

    /** @todo Load users from lobby into GameSession.users */
  }

  static resolveSession(lobbyCode) {
    this.sessionDictionary[lobbyCode] = undefined;
  }
}

SessionManager.sessionDictionary = {};

module.exports = SessionManager;
