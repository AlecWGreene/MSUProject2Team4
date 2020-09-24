const { GameSession: GameSession } = require("./gameSession.js");

class SessionManager {
  constructor() {
    this.sessionDictionary = {};
    
  }

  static getInstance(){
    if(){
      const sessionManager = new SessionManager();
      this.instance = sessionManager;
    }
    return this.instance;
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

SessionManager

module.exports = SessionManager;
