const { GameSession: GameSession } = require("./gameSession.js");

class SessionManager {
  constructor() {
    this.sessionDictionary = {};
  }

  static getInstance() {
    if (SessionManager.instance === null) {
      const sessionManager = new SessionManager();
      SessionManager.instance = sessionManager;
    }
    return SessionManager.instance;
  }

  createSession(lobbyCode, customSettings) {
    // Register new session
    this.sessionDictionary[lobbyCode] = new GameSession(
      lobbyCode,
      customSettings
    );

    /** @todo Load users from lobby into GameSession.users */
  }

  resolveSession() {
    this.sessionDictionary[lobbyCode] = undefined;
  }
}

SessionManager.instance = null;

module.exports = SessionManager;
