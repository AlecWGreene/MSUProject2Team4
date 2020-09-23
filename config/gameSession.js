"use strict";

class GameSession {
  constructor(lobbyCode, customSettings) {
    // Static variables
    this.phases = [
      "Party Selection",
      "Party Validation",
      "Party Voting",
      "Computing"
    ];
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

    // Timeout variables
    this.timeout_PartyValid = null;


    // Game variables
    this.currentPhase = "";
    this.currentParty = [];
    this.users = [];
    this.currentKingIndex = -1;
    this.gameOver = false;
    this.quests = [];
    this.roleAssignments = {};
    this.passedQuests = 0;
    this.currentQuestIndex = -1;
    this.numberPartyVotes = 0;
    this.candidateParty = [];
    this.currentParty = [];
    this.partyVotes = {};
    this.partyValidVotes = {};

    // Apply any custom settings
    this.applyCustomSettings(customSettings);
    this.setupGame();
  }

  // Change game settings
  applyCustomSettings(customSettings) {
    // Timer settings
    this.maxDuration_partySelection = 10000;
    this.maxDuration_partyValidVote = 10000;
    this.maxDuration_partyPassVote = 10000;

    // Set quests and roles
    this.quests = this.questCriteria.medium;
    this.numMinions =
      customSettings.gameSize && customSettings.gameSize != "medium"
        ? customSettings.gameSize === "large"
          ? 4
          : 2
        : 3;
  }

  // Initialize GameSession to run
  setupGame(lobbyCode) {
    // =================================== DEBUG CODE ===================================
    this.lobbyCode = lobbyCode;
    this.ready = true;
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

    // Setup strings to represent role tokens
    const roleArray = (
      "Merlin==" +
      "Assassin==" +
      "Minion==".repeat(this.numMinions - 1) +
      "Hero==".repeat(Math.max(0, this.users.length - 1 - this.numMinions))
    ).split("==");
    roleArray.pop();
    this.roles = roleArray;

    // Over complicated way of assigned random roles to a random number of users
    const userIdArray = this.users.map(user => user.id);
    for (let i = 0; i < this.roles.length; i++) {
      this.roleAssignments[
        userIdArray.splice(Math.floor(Math.random() * userIdArray.length), 1)
      ] = this.roles[i];
    }

    // Initialize game variables
    this.currentPhase = "Party Selection";
    this.currentKingIndex = Math.floor(Math.random() * this.users.length);
    this.gameOver = false;
    this.passedQuests = 0;
    this.currentQuestIndex = 0;
  }

  // Timout function
  forcePartyValidVote(duration) {
    console.log("Forcing valid vote in 7 seconds");
    this.timeout_PartyValid = setTimeout(() => {
      for (let i = 0; i < this.users.length; i++) {
        if (!Object.keys(this.partyValidVotes).includes(this.users[i].id)) {
          this.setUserVote_ValidParty(this.users[i], 1);
        }
      }
    }, duration);
  }

  // Assign users to a candidate party
  setPartySelection(userArray) {
    // Copy values from array
    this.candidateParty = Array.from(userArray);

    /** @todo implement invalid party handlers */
    // Trim out excess
    if (userArray.length > this.quests[this.currentQuestIndex].partySize) {
    }
    // Fill missing slots
    else if (userArray.length < this.quests[this.currentQuestIndex].partySize) {
    }

    this.currentPhase = "Party Validation";
    this.forcePartyValidVote(7000);
  }

  // Use the candidate party
  setParty(userArray) {}

  // Cast a vote on a party selection
  setUserVote_ValidParty(user, vote) {
    if (this.currentPhase !== "Party Validation") {
      return false;
    }

    // Allocate user's vote
    this.partyValidVotes[user.id] = vote;

    // If all votes are in, then tally them
    if (Object.keys(this.partyValidVotes).length === this.users.length) {
      // End party validation phase
      this.currentPhase = "Computing";
      clearTimeout(this.timeout_PartyValid);

      // Tally votes
      let numYes = 0,
        numNo = 0;
      for (let i = 0; i < this.users.length; i++) {
        if (this.partyValidVotes[this.users[i].id] === 1) {
          numYes++;
        } else if (this.partyValidVotes[this.users[i].id] === -1) {
          numNo++;
        } else {
          throw new Error("User vote value is not recognized");
        }
      }

      // If the vote passes, then set the candidate as current party otherwise restart the vote
      if (numYes >= numNo) {
        this.setParty(this.candidateParty);
      } else {
        this.candidateParty = [];
        this.currentKingIndex = (this.currentKingIndex + 1) % this.users.length;
        this.currentPhase = "Party Selection";
      }
    }
  }

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
