const {
  GameSession: GameSession
} = require("./gameSession");

// Create a game session
const testSession = new GameSession("AB12CD34", {});

console.dirxml(testSession);

function testFn(){
    console.log(`
==================== Game Phase: ${testSession.currentPhase} ====================

-------------------- Waiting On -------------------------------------------------
Party Selection: ${testSession.waitingOn_PartySelection()}
Party Approval: ${testSession.waitingOn_PartyValidVote()}
Party Vote: ${testSession.waitingOn_PartyVote()}

-------------------- Quest Counter -------------------------------------------------
Number of Passed Quests: ${testSession.passedQuests}

-------------------- Current Quest -------------------------------------------------
King: ${testSession.users[testSession.currentKingIndex].username}
Members: ${testSession.currentParty.join(", ")}

-------------------- Party Vote  -------------------------------------------------
Votes: ${JSON.stringify(testSession.partyVotes)}

-------------------- Party Valid Vote -------------------------------------------------
Potential Members: ${JSON.stringify(testSession.candidateParty)}
Number of Approvals: ${JSON.stringify(testSession.partyValidVotes)}

`);
}

setInterval(testFn, 500);