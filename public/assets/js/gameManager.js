// DOM references
const $modalContainer = $("#modal-container");

// Global variables
let cachedState = null;
let lobbyCode = "aaaaaaaa";
let currentTime = 0;
let timerInterval, updateInterval;

// Checks cahced game state against server
function checkForUpdate() {
    return new Promise(resolve => {
        $.post(`/api/game/${lobbyCode}/state`, {cache: cachedState}).then( data => {
          if (data === "Up to date") {
            console.log("Game state matches cloud");
            resolve();
          } else{
            cachedState = data;
            updatePage(data);
            resolve();
          }
        });
    });
}

// Visualize timeout
function updateProgressBar(duration, currentTime) {
  $(".progress-bar").css("width",((currentTime / duration) * 100).toString() + "\%");
}

// Gets current state and updates outdate information
function updatePage(gameState) {
  console.log("Updated Game State");
  console.log(gameState);

  // Update quests

  // Display appropriate modal to user
  switch(gameState.phase) {
    case "Character Reveal":
      break;
    case "Party Selection":
        if (gameState.isKing) {
          offerPartySelection(gameState);
        }
        else {
          stallUser(gameState);
        }
      break;
    case "Party Validation":
      offerPartyValidVote(gameState);
      break;
    case "Party Voting":
      if (gameState.inParty) {
        offerPartyPassVote(gameState)
      }
      else {
        stallUser(gameState);
      }
      break;
    case "Computing":
      stallUser({ duration: 0 });
      break;
    case "Game Over":
      stallUser({ duration: 0 });
      break;
  }
}

// Remove existing modals and display a new one
function displayModal(modal) {
  $modalContainer.empty();
  $modalContainer.append(modal);
}

// Show the waiting modal
function stallUser(data) {
  // Display roles to pertinent characters
  const $modal = getWaitModal(data.phase);
  displayModal($modal);

  // Setup intervals for page update and progressbar timer
  const duration = data.duration;
  currentTime = duration;
  timerInterval = setInterval(() => updateProgressBar(duration, currentTime -= 100),100);
}

// Show the user any information they are revealed at the beginning of the game
function displayReveals(showDuration, data) {
  // Display roles to pertinent characters
  const $modal = getWaitModal("users to look over the reveal information");
  const $dataList = $("<ul>");
  data.reveals.forEach(el => $dataList.append($("<li>").text(el.name + "--" + el.role)));
  $($modal.children()[1]).append($dataList);
  displayModal($modal);

  // Setup intervals for page update and progressbar timer
  const duration = showDuration;
  currentTime = duration;
  timerInterval = setInterval(() => updateProgressBar(duration, currentTime -= 100),100);
}

// Ask for player's approval on the candidate party
function offerPartyValidVote(data) {
  // Display roles to pertinent characters
  const $modal = getPartyValidVoteModal(data.party);
  displayModal($modal);

  // Setup intervals for page update and progressbar timer
  const duration = data.duration;
  currentTime = duration;
  timerInterval = setInterval(() => updateProgressBar(duration, currentTime -= 100),100);
}

// Ask for play to pass or fail the quest
function offerPartyPassVote(data) {
    // Display roles to pertinent characters
    const $modal = getPartyValidVoteModal(data.party);
    displayModal($modal);
  
    // Setup intervals for page update and progressbar timer
    const duration = data.duration;
    currentTime = duration;
    timerInterval = setInterval(() => updateProgressBar(duration, currentTime -= 100),100);
}

// Ask player to pick a candidate party
function offerPartySelection(data) {
  // Display roles to pertinent characters
  const $modal = getPartySelectModal(data.users);
  displayModal($modal);

  // Setup intervals for page update and progressbar timer
  const duration = data.duration;
  currentTime = duration;
  timerInterval = setInterval(() => updateProgressBar(duration, currentTime -= 100),100);
}

// Display the quest result to the user
function updateQuestResult(questIndex, result) {
  
}

// DUBUGGING ONLY
$(document).ready(() => {
  // $.post("/api/lobby/create", { partySize: 4}).then(code => {
  //   lobbyCode = code;
    $.post("/api/lobby/start-game").then(resp => {
      if(resp.message === "Game Started"){
        // Game is ready
        lobbyCode = resp.code
        $.get(`/api/game/${lobbyCode}/run`).then(data => {
          if(data){
            displayReveals(30000, data);
            updateInterval = setInterval(() => checkForUpdate(), 5000);
          }
        }).catch(handleAJAXError);
      } else{
        // If user refresehd the page mid game
      }
    }).catch(handleAJAXError);
  });
// })

// Display AJAX errors in the console
function handleAJAXError(xhr, status, err) {
  console.log(["Error: ", err]);
}