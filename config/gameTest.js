const { GameSession: GameSession, GameState } = require("./gameSession");

// Create a game session
const testSession = new GameSession("AB12CD34", {});

const users = [
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

let time = 0, clockTime = 0;
function testFn() {
  console.clear();
  /** console.log(`
==================== Game Phase: ${testSession.currentPhase} ====================
Game Time: ${(time += 0.5)}s

-------------------- Quest Counter -------------------------------------------------
Number of Passed Quests: ${testSession.passedQuests}

-------------------- Current Quest -------------------------------------------------
King: ${testSession.users[testSession.currentKingIndex].username}
Members: ${testSession.currentParty.map(user => user.username).join(", ")}
Party Size: ${testSession.quests[testSession.currentQuestIndex].partySize}
Required Fails: ${
    testSession.quests[testSession.currentQuestIndex].requiredFails
  }

-------------------- Party Vote  -------------------------------------------------
Votes: ${JSON.stringify(testSession.partyPassVotes)}

-------------------- Party Valid Vote -------------------------------------------------
Potential Members: ${testSession.candidateParty
    .map(value => value.username)
    .join(", ")}
Number of Approvals: ${JSON.stringify(testSession.partyValidVotes)}

`); */
  console.log("TimeStamp: " + (clockTime += 0.5) + "s");
  console.dirxml(new GameState(testSession).getPhaseInfo());
}

setInterval(testFn, 500);

setTimeout(() => {}, 5000);

// First party selection
setTimeout(() => {
  testSession.setPartySelection(
    testSession.users.filter((value, index) => [1, 2, 6].includes(index))
  );
}, time += 5000);

// First part voting round 1
setTimeout(() => {
  testSession.setUserVote_ValidParty(users[0], 1);
  testSession.setUserVote_ValidParty(users[1], -1);
  testSession.setUserVote_ValidParty(users[2], 1);
}, time += 3000);
setTimeout(() => {
  testSession.setUserVote_ValidParty(users[3], 1);
  testSession.setUserVote_ValidParty(users[4], -1);
  testSession.setUserVote_ValidParty(users[5], 1);
}, time += 4000);

// Vote should pass


