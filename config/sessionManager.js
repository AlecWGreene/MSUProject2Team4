const { GameSession: GameSession } = require("./gameSession.js");

class SessionManager {
  static createSession(users, customSettings) {
    // Register new session
    this.sessionDictionary[lobbyCode] = new GameSession(users, customSettings);
  }

  static resolveSession(lobbyCode) {
    this.sessionDictionary[lobbyCode] = undefined;
  }
}

SessionManager.sessionDictionary = {};

// Create the "static" instance and return it
module.exports = function() {
  return new SessionManager();
};
