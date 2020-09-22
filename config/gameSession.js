"use strict";

class GameSession {
  constructor(lobbyCode, customSettings) {
    // Static variables
    this.questCriteria = {
      large: [
        {
          partySize: 3,
          requiredFails: 1
        },
        {
          partySize: 4,
          requiredFails: 1
        },
        {
          partySize: 4,
          requiredFails: 1
        },
        {
          partySize: 5,
          requiredFails: 2
        },
        {
          partySize: 5,
          requiredFails: 1
        }
      ],
      medium: [
        {
          partySize: 2,
          requiredFails: 1
        },
        {
          partySize: 3,
          requiredFails: 1
        },
        {
          partySize: 3,
          requiredFails: 1
        },
        {
          partySize: 4,
          requiredFails: 2
        },
        {
          partySize: 4,
          requiredFails: 1
        }
      ],
      small: [
        {
          partySize: 2,
          requiredFails: 1
        },
        {
          partySize: 3,
          requiredFails: 1
        },
        {
          partySize: 2,
          requiredFails: 1
        },
        {
          partySize: 3,
          requiredFails: 1
        },
        {
          partySize: 3,
          requiredFails: 1
        }
      ]
    };
    this.lobbyCode = lobbyCode;
    this.settings = {};
    this.users = [];
    this.phases = [
      "Party Selection",
      "Party Validation",
      "Party Formation",
      "Party Voting"
    ];

    // Game variables
    this.gameOver = false;
    this.quests = [];
    this.roleAssignments = {};
    this.currentKingIndex = -1;
    this.currentPhase = "";
    this.passedQuests = 0;
    this.currentQuestIndex = -1;
    this.numberPartyVotes = 0;
    this.candidateParty = [];
    this.currentParty = [];
    this.partyVotes = {};
    this.partyValidVotes = {};

    // Setup method calls
    this.applyCustomSettings(customSettings);
    this.setupGame(lobbyCode);
    this.startGame();
  }

  // Modify the instance to incorporate the chosen settings
  applyCustomSettings(customSettings) {
    // Use default settings
    if (!customSettings || Object.keys(customSettings).length === 0) {
      this.quests = Array.from(this.questCriteria.medium);
      this.voteDuration_ValidParty = 1 * 60 * 1000; // 7 minutes
      this.voteDuration_PassParty = 1 * 60 * 1000; // 1.5 minutes
      this.numberMinions = 3;
    } else {
      // Apply custom settings that are given
      this.quests = customSettings.size
        ? Array.from(this.questCriteriap[customSettings.size])
        : Array.from(this.questCriteria.medium);
      this.voteDuration_ValidParty = customSettings.voteDuration_ValidParty
        ? customSettings.voteDuration_ValidParty
        : 7 * 60 * 1000; // Chosen time in ms or 7 minutes
      this.voteDuration_PassParty = customSettings.voteDuration_PassParty
        ? customSettings.voteDuration_PassParty
        : 1.5 * 60 * 1000; // Chosen time in ms or 1.5 minutes
      this.numberMinions = customSettings.numberMinions
        ? customSettings.numberMinions
        : 3;
    }
  }

  // Initialize environment for a game sesion
  setupGame() {
    // =================================== DEBUG CODE ===================================
    // Create fake array of users
    this.users = [
      {
        id: 1,
        username: "Alec"
      },
      {
        id: 2,
        username: "Desare"
      },
      {
        id: 3,
        username: "Olga"
      },
      {
        id: 4,
        username: "Ben"
      },
      {
        id: 5,
        username: "Spencer"
      },
      {
        id: 6,
        username: "Miranda"
      },
      {
        id: 7,
        username: "Josh"
      }
    ];

    // ==================================================================================
    const numUsers = this.users.length;
    const roleArray = (
      "Merlin==" +
      "Assassin==" +
      "Minion==".repeat(2) +
      "Hero==".repeat(Math.max(0, numUsers - 2 - 2))
    ).split("==");
    roleArray.pop();

    // Over complicated way of assigned random roles to a random number of users
    let userIdArray = Array.apply(null, {length: numUsers}).map(Number.call, Number);
    for(let i=0; i< roleArray.length; i++){
        this.roleAssignments[userIdArray.splice(Math.floor(Math.random() * userIdArray.length),1)] = roleArray[i];
    }
  }

  // Begin the game
  startGame() {
    if(!this.ready){
      return false;
    }

    // Game variables
    this.gameOver = false;
    this.roleAssignments = {};
    this.currentKingIndex = -1;
    this.currentPhase = "";
    this.passedQuests = 0;
    this.currentQuestIndex = -1;
    this.numberPartyVotes = 0;
    this.candidateParty = [];
    this.currentParty = [];
    this.partyVotes = {};
    this.partyValidVotes = {};

    this.running = true;
  }

  // Assign users to a candidate party
  setPartySelection(userArray) {}

  // Use the candidate party
  setParty(userArray) {}

  // Cast a vote on a party selection
  setUserVote_ValidParty(user, vote) {}

  // Cast a vote on a party validation
  setUserVote_PassParty(user, vote) {}

  // Is the game waiting on a candidate party to be selected?
  waitingOn_PartySelection() {}

  // Is the game waiting on a party to be agreed upon?
  waitingOn_PartyValidVote() {}

  // Is the game waiting on a party to vote?
  waitingOn_PartyVote() {}
}

module.exports = { GameSession: GameSession };
