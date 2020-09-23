"use strict";

class GameSession {
  constructor(lobbyCode, customSettings) {
    // Static variables
    this.phases = [
      "Party Selection",
      "Party Validation",
      "Party Voting",
      "Computing",
      "Game Over"
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
    this.timeout_PartySelection = null;
    this.timeout_PartyValid = null;
    this.timeout_PartyPass = null;

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
    this.candidateParty = [];
    this.currentParty = [];
    this.partyPassVotes = {};
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
      customSettings.gameSize && customSettings.gameSize !== "medium"
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

  // Timout function for party validation phase
  forcePartySelection(duration) {
    this.timeout_PartySelection = setTimeout(() => {
      this.setPartySelection([]);
    }, duration);
  }

  // Timout function for party validation phase
  forcePartyValidVote(duration) {
    this.timeout_PartyValid = setTimeout(() => {
      for (let i = 0; i < this.users.length; i++) {
        if (!Object.keys(this.partyValidVotes).includes(this.users[i].id)) {
          this.setUserVote_ValidParty(this.users[i], 1);
        }
      }
    }, duration);
  }

  // Timout function for party validation phase
  forcePartyPassVote(duration) {
    this.timeout_PartyPass = setTimeout(() => {
      for (let i = 0; i < this.currentParty.length; i++) {
        if (!Object.keys(this.partyPassVotes).includes(this.currentParty[i])) {
          // Get the current user
          const thisUser = this.users.find(
            value => value.id === this.currentParty[i].id
          );

          // Force heroes to vote pass and minions to vote fail
          this.setUserVote_PassParty(
            thisUser,
            ["Assassin", "Minion"].includes(this.roleAssignments[thisUser.id])
              ? -1
              : 1
          );
        }
      }
    }, duration);
  }

  // Assign users to a candidate party
  setPartySelection(userArray) {
    const partySize = this.quests[this.currentQuestIndex].partySize;

    // Trim out excess
    if (userArray.length > partySize) {
      userArray = userArray.splice(0, partySize);
    }
    // Fill missing slots
    else if (userArray.length < partySize) {
      // If king is missing include king
      const userKing = this.users[this.currentKingIndex];
      if (!userArray.includes(userKing)) {
        userArray.push(userKing);
      }

      // Fill in the remaining slots
      while (userArray.length < partySize) {
        // Pick random user and check if they are in the array already or not
        const randIndex = Math.floor(Math.random() * this.users.length);
        const randUser = this.users[randIndex];
        if (!userArray.includes(randUser)) {
          userArray.push(randUser);
        }
      }
    }

    // Copy values from array and change phase
    this.candidateParty = Array.from(userArray);
    this.currentPhase = "Party Validation";
    this.forcePartyValidVote(7000);
  }

  // Use the candidate party
  setParty(userArray) {
    this.currentParty = Array.from(userArray);
    this.currentPhase = "Party Voting";
    this.forcePartyPassVote(7000);
  }

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
        this.candidateParty = [];
        this.partyValidVotes = {};
      } else {
        this.candidateParty = [];
        this.currentKingIndex = (this.currentKingIndex + 1) % this.users.length;
        this.partyValidVotes = {};
        this.currentPhase = "Party Selection";
      }
    }
  }

  // Cast a vote on a party validation
  setUserVote_PassParty(user, vote) {
    // If the phase is not correct return out
    if (this.currentPhase !== "Party Voting") {
      return false;
    }

    // If user is not in the current party then return out
    if (!this.currentParty.includes(user)) {
      return false;
    }

    // If vote isn't 1 or -1 then return out
    if (Math.abs(vote) !== 1) {
      return false;
    }

    if (
      ["Merlin", "Percival", "Hero"].includes(this.roleAssignments[user.id])
    ) {
      if (vote !== 1) {
        console.log("Good Guys can't vote to fail parties");
      }

      this.partyPassVotes[user.id] = 1;
    } else {
      this.partyPassVotes[user.id] = vote;
    }

    // Check if all votes are cast
    if (Object.keys(this.partyPassVotes).length === this.currentParty.length) {
      // Change phase
      clearTimeout(this.timeout_PartyPass);
      this.currentPhase = "Computing";

      // Count any fails
      let numFails = 0;
      let failed = false;
      for (const tempUser in this.partyPassVotes) {
        if (this.partyPassVotes[tempUser] === -1) {
          numFails++;
          if (this.quests[this.currentQuestIndex].requiredFails <= numFails) {
            failed = true;
            break;
          }
        }
      }

      // Increment counter if quest didn't fail
      this.passedQuests += failed ? 0 : 1;
      this.currentQuestIndex++;

      // If all quests are done end game
      if (this.currentQuestIndex === 5) {
        this.gameOver = true;
        this.currentPhase = "Game Over";
      }
      // If number of passed quests is met
      else if (this.passedQuests === 3) {
        this.gameOver = true;
        this.currentPhase = "Game Over";
      }
      // Move to next quest
      else {
        this.currentPhase = "Party Selection";
        this.partyPassVotes = {};
        this.currentParty = [];
        this.candidateParty = [];
        this.currentKingIndex = (this.currentKingIndex + 1) % this.users.length;
        this.forcePartySelection(5000);
      }
    }
  }
}

module.exports = { GameSession: GameSession };
