const { GameSession: GameSession } = require("./gameSession.js");

class SessionManager {
  static createSession(lobbyCode, customSettings) {
    // Register new session
    this.sessionDictionary[lobbyCode] = new GameSession(
      lobbyCode,
      customSettings
    );

    /** @todo Load users from lobby into GameSession.users */
  }

  static resolveSession(lobbyCode) {
    this.sessionDictionary[lobbyCode] = undefined;
  }
}

SessionManager.sessionDictionary = {};

module.exports = SessionManager;
