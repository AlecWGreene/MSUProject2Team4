const {
  GameSession: GameSession
} = require("./gameSession");

// Create a game session
const testSession = new GameSession("AB12CD34", {});

console.dirxml(testSession);

let time  = 0;
function testFn(){
    console.clear();
    console.log(`
==================== Game Phase: ${testSession.currentPhase} ====================
Game Time: ${time+=0.5}s

-------------------- Waiting On -------------------------------------------------
Party Selection: ${testSession.waitingOn_PartySelection()}
Party Approval: ${testSession.waitingOn_PartyValidVote()}
Party Vote: ${testSession.waitingOn_PartyVote()}

-------------------- Quest Counter -------------------------------------------------
Number of Passed Quests: ${testSession.passedQuests}

-------------------- Current Quest -------------------------------------------------
King: ${testSession.users[testSession.currentKingIndex].username}
Members: ${testSession.currentParty.map(user => user.username).join(", ")}
Party Size: ${testSession.quests[testSession.currentQuestIndex].partySize}
Required Fails: ${testSession.quests[testSession.currentQuestIndex].requiredFails}

-------------------- Party Vote  -------------------------------------------------
Votes: ${JSON.stringify(testSession.partyPassVotes)}

-------------------- Party Valid Vote -------------------------------------------------
Potential Members: ${testSession.candidateParty.map(value => value.username).join(", ")}
Number of Approvals: ${JSON.stringify(testSession.partyValidVotes)}

`);
}

setInterval(testFn, 500);

setTimeout(function(){
    
}, 5000);

// First party selection
setTimeout(function(){
    testSession.setPartySelection(testSession.users.filter((value,index) => [1,2,6].includes(index)));
}, 5000);