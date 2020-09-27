const { GameSession: GameSession } = require("./gameSession.js");

class SessionManager {
  constructor() {
    this.sessionDictionary = {};
  }

  createSession(lobbyCode, users, customSettings) {
    // Register new session
    this.sessionDictionary[lobbyCode] = new GameSession(users, customSettings);
  }

  resolveSession(lobbyCode) {
    this.sessionDictionary[lobbyCode] = undefined;
  }
}

// Create the "static" instance and return it
module.exports = SessionManager;
