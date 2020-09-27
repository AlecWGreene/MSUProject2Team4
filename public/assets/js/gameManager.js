// DOM references
const $modalContainer = $("#modal-container");

// Global variables
let cachedState = null;
let lobbyCode = "aaaaaaaa";

// Checks cahced game state against server
function checkForUpdate() {
    return new Promise(resolve => {
        $.get(`/api/game/${lobbyCode}/state`, {cache: cachedState}).then( data => {
          if (data === false) {
            resolve();
          } else{
            updatePage(data);
            resolve();
          }
        });
    });
}

// Gets current state and updates outdate information
function updatePage(gameState) {
  console.log(gameState);
}

// Remove existing modals and display a new one
function displayModal(modal) {
  $modalContainer.empty();
  $modalContainer.append(modal);
}

// Show the user any information they are revealed at the beginning of the game
function displayReveals() {

}

// Ask for player's approval on the candidate party
function offerPartyValidVote(userArray) {

}

// Ask for play to pass or fail the quest
function offerPartyPassVote() {

}

// Ask player to pick a candidate party
function offerPartySelection() {

}

// Display the quest result to the user
function updateQuestResult(questIndex, result) {

}

// DUBUGGING ONLY
$(document).ready(() => {
  $.post("/api/lobby/create", { partySize: 4}).then(code => {
    lobbyCode = code;
    $.post("/api/lobby/start-game").then(resp => {
      if(resp === "Game Started"){
        // Game is ready
        $.get(`/api/game/${lobbyCode}/run`).then(success => {
          console.log("Success!: " + JSON.stringify(success));
          if(success){
            console.log(success);
          }
        }).catch(handleAJAXError);
      }
    }).catch(handleAJAXError);
  }).catch(handleAJAXError);
})

function handleAJAXError(xhr, status,err) {
  console.log("Error" + JSON.stringify(err));
}