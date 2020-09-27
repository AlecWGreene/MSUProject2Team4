/* eslint-disable no-empty */
/* eslint-disable indent */
"use strict";

class GameSession {
  constructor(userArray, customSettings) {
    // Static variables
    this.phases = [
      "Character Reveal",
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
    this.numFails = 0;
    this.questResults = [];
    this.currentPhase = "";
    this.currentParty = [];
    this.users = userArray;
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
    this.prevPartyValidVotes = {};
    this.prevPartyPassVotes = {};

    // Apply any custom settings
    this.applyCustomSettings(customSettings);
    this.setupGame();
  }

  // Indicates if the cached GameState is outdates
  stateCacheNeedsUpdate(state) {
    // Check if phases match
    if (state.phase !== this.currentPhase) {
      return true;
    }
    // One state update per character reveal
    else if (state.phase === "Character Reveal") {
      return false;
    }
    // Check if quest indices match
    else if (state.currentQuestIndex !== this.currentQuestIndex) {
    }
    // Check if nothing?
    else if (state.currentPhase === "Party Selection") {
    }
    // Check if the lists of voted users matches
    else if (state.currentPhase === "Party Validation") {
      for (const user of this.users) {
        if (state.partyValidVotes[user.id] !== this.partyValidVotes[user.id]) {
          return true;
        }
      }
    }
    // Check if nothing?
    else if (state.currentPhase === "Party Voting") {
    }

    return false;
  }

  // Change game settings
  applyCustomSettings(customSettings) {
    // Timer settings
    this.maxDuration_partySelection = 15000;
    this.maxDuration_partyValidVote = 15000;
    this.maxDuration_partyPassVote = 15000;

    // Apply specified timeouts
    if (customSettings.timeLimits) {
      if (customSettings.timeLimits.partySelection) {
        this.maxDuration_partySelection =
          customSettings.timeLimits.partySelection;
      }
      if (customSettings.timeLimits.partyValidVote) {
        this.maxDuration_partyValidVote =
          customSettings.timeLimits.partyValidVote;
      }
      if (customSettings.timeLimits.partyPassVote) {
        this.maxDuration_partyPassVote =
          customSettings.timeLimits.partyPassVote;
      }
    }

    // Set quests and roles
    this.quests = this.questCriteria.medium;
    this.numMinions =
      customSettings.gameSize && customSettings.gameSize !== "medium"
        ? customSettings.gameSize === "large"
          ? 4
          : 2
        : 3;
  }

  // Clear running timers
  clearAllTimeouts() {
    clearTimeout(this.timeout_PartyValid);
    clearTimeout(this.timeout_PartyPass);
    clearTimeout(this.timeout_PartySelection);
  }

  // Initialize GameSession to run
  setupGame() {
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
    this.currentPhase = "Character Reveal";
    this.currentKingIndex = Math.floor(Math.random() * this.users.length);
    this.gameOver = false;
    this.passedQuests = 0;
    this.currentQuestIndex = 0;
    this.ready = true;
  }

  revealCharacterInfo() {
    setTimeout(() => {
      this.currentPhase = "Party Selection";
      this.forcePartySelection(this.maxDuration_partySelection);
    }, 30000); /** @todo Add setting */
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
        if (
          !Object.keys(this.partyValidVotes).includes(
            this.users[i].id.toString()
          )
        ) {
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
    if (this.currentPhase !== "Party Selection") {
      return false;
    }
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
    this.forcePartyValidVote(this.maxDuration_partyValidVote);
  }

  // Use the candidate party
  setParty(userArray) {
    if (
      this.currentPhase !== "Computing" ||
      this.candidateParty.length !==
        this.quests[this.currentQuestIndex].partySize
    ) {
      return false;
    }

    this.clearAllTimeouts();
    this.currentParty = Array.from(userArray);
    this.prevPartyValidVotes = this.partyValidVotes;
    this.partyValidVotes = {};
    this.forcePartyPassVote(this.maxDuration_partyPassVote);
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
        this.numFails = 0;
        this.candidateParty = [];
        this.currentPhase = "Party Voting";
      } else {
        this.candidateParty = [];
        this.currentKingIndex = (this.currentKingIndex + 1) % this.users.length;
        this.currentPhase = "Party Selection";
        this.prevPartyValidVotes = this.partyValidVotes;
        this.partyValidVotes = {};
        this.forcePartySelection(this.maxDuration_partySelection);
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
      this.questResults[this.currentQuestIndex] = failed ? -1 : 1;
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
      // If number of failed quests is met
      else if (this.numFails === 3) {
        this.gameOver = true;
        this.currentPhase = "Game Over";
      }
      // Move to next quest
      else {
        this.currentPhase = "Party Selection";
        this.prevPartyPassVotes = this.partyPassVotes;
        this.partyPassVotes = {};
        this.candidateParty = [];
        this.currentKingIndex = (this.currentKingIndex + 1) % this.users.length;
        this.forcePartySelection(this.maxDuration_partySelection);
      }
    }
  }
}

class GameState {
  constructor(session) {
    this.session = session;
    this.phases = session.phases;
    this.questCriteria = session.questCriteria;

    // Game variables
    this.numFails = session.numFails;
    this.questResults = session.questResults;
    this.currentPhase = session.currentPhase;
    this.currentParty = session.currentParty;
    this.users = session.users;
    this.currentKingIndex = session.currentKingIndex;
    this.gameOver = session.gameOver;
    this.quests = session.quests;
    this.roleAssignments = session.roleAssignments;
    this.passedQuests = session.passedQuests;
    this.currentQuestIndex = session.currentQuestIndex;
    this.candidateParty = session.candidateParty;
    this.currentParty = session.currentParty;
    this.partyPassVotes = session.partyPassVotes;
    this.partyValidVotes = session.partyValidVotes;
    this.prevPartyValidVotes = session.prevPartyValidVotes;
    this.prevPartyPassVotes = session.prevPartyPassVotes;
  }

  debug_displaySession() {
    const data = this.getPhaseInfo();

    // Show roles
    data.roles = {};
    for (const user of this.users) {
      data.roles[user.username] = this.roleAssignments[user.id];
    }

    // Add info per phase
    switch (data.phase) {
      case "Party Selection":
        data.votes = {};
        for (const user of this.currentParty) {
          data.votes[user.username] = this.prevPartyPassVotes[user.id];
        }
        break;
      case "Party Validation":
        break;
      case "Party Voting":
        break;
      case "Computing":
        break;
      case "Game Over":
        break;
    }

    return data;
  }

  getRevealInfo(role) {
    const roles = Object.entries(this.roleAssignments);
    switch (role) {
      case "Merlin":
        return roles
          .filter(entry => ["Minion", "Assassin"].includes(entry[1]))
          .map(entry => {
            return {
              name: entry[0],
              role: entry[1]
            };
          });
      case "Percival":
        return roles
          .filter(entry => ["Merlin"].includes(entry[1]))
          .map(entry => entry[0]);
      case "Assassin":
      case "Minion":
        return roles
          .filter(entry => ["Minion"].includes(entry[1]))
          .map(entry => entry[0]);
    }
  }

  getPhaseInfo(user) {
    const data = {};

    // Get phase and structure object with phase data
    data.phase = this.currentPhase;
    data.duration = 30000;
    data.king = this.users[this.currentKingIndex];
    if (data.king.id === user.id) {
      data.isKing = true;
    }
    data.history = this.questResults;
    switch (data.phase) {
      case "Party Selection":
        // Show previous quest result
        if (this.currentQuestIndex !== 0) {
          data.prevParty = this.currentParty.map(user => {
            return {
              id: user.id,
              name: user.username
            };
          });
          data.prevFails = this.numFails;
        }
        data.users = this.users.map(user => {
          return {
            id: user.id,
            name: user.username
          };
        });
        break;
      case "Party Validation":
        // Show candidate party
        data.party = this.candidateParty.map(user => {
          return {
            id: user.id,
            name: user.username
          };
        });
        data.votes = {};
        for (const user of this.users) {
          // If user vas voted
          if (this.partyValidVotes[user.id]) {
            data.votes[user.username] = 1;
          } else {
            data.votes[user.username] = 0;
          }
        }
        break;
      case "Party Voting":
        // Show who voted to send the party
        data.party = this.currentParty.map(user => {
          return {
            id: user.id,
            name: user.username
          };
        });
        data.votes = {};
        for (const user of this.users) {
          data.votes[user.username] = this.prevPartyValidVotes[user.id];
        }
        break;
      case "Computing":
        break;
      case "Game Over":
        break;
    }
    return data;
  }
}

module.exports = { GameSession: GameSession, GameState: GameState };
