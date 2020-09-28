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
      if ($($modalContainer).children().length === 0) {
        displayReveals(gameState.duration, gameState);
      }
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
    case "Assassin Hunting":
      if (gameState.isAssassin) {  
        const modal = getModalTemplate();
        $($(modal).children()[0]).text("Assassin, select someone to assassinate");

        // Set the body as all non-assassin players
        const choiceBody = $("<ul>").addClass("selection-list");
        for (const user of data.users) {
          if (gameState.assassinId !== user.id) {
            const userItem = $("<li>")
              .addClass("selection-item")
              .attr("data-id", user.id)
              .text(user.name);
            choiceBody.append(userItem);
          }
        }
        $($(modal).children()[1]).append(choiceBody);

        // Add button to perform assassination
        const selectButton = $("<button>").attr("id","assassin-select-button").addClass("btn").addClass("btn-danger").text("Assassinate");
        $($(modal).children()[2]).append(selectButton);
        displayModal(modal)
      }
      else {
        let modal = getModalTemplate();
        $($(modal).children()[0]).text("Waiting on Assassin to pick his target");
        $($(modal).children()[1]).text(`Assassin was ${gameState.assassin}`);
        displayModal(modal)
      }
      break;
    case "Game Over":
      let modal = getModalTemplate();
      $($(modal).children()[0]).text("Game Over!");
      $($(modal).children()[1]).text((gameState.winner === 1) ? "Heroes of Merlin are victorious!" : "Minions of Mordred have prevailed!");
      displayModal(modal);
      break;
  }

  addEventHandlers(gameState.phase);
  updateQuestResult(gameState);
}

// Remove existing modals and display a new one
function displayModal(modal) {
  $modalContainer.empty();
  $modalContainer.append(modal);
  $modalContainer.removeClass("hide");
  $("#game-modal").attr("data-lobbyCode", lobbyCode);
}

// Show the waiting modal
function stallUser(data) {
  // Display roles to pertinent characters
  const $modal = getWaitModal(data.phase);
  displayModal($modal);
  addEventHandlers(data.phase);

  // Setup intervals for page update and progressbar timer
  const duration = data.duration;
  currentTime = duration;
  timerInterval = setInterval(() => updateProgressBar(duration, currentTime -= 100),100);
}

// Show the user any information they are revealed at the beginning of the game
function displayReveals(showDuration, data) {
  // Display roles to pertinent characters
  const $modal = getWaitModal("users to look over the reveal information. Your role is: " + data.userRole);
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
function updateQuestResult(gameState) {
  for (let i = 0; i < 5; i++) {
    if ($(`#quest-${i}`).hasClass("empty") && i < gameState.history.length) {
      if (gameState.history[i] === 1) {
        $(`#quest-${i}`).removeClass("empty");
        $(`#quest-${i}`).addClass("pass");
      }
      else if (gameState.history[i] === -1) {
        $(`#quest-${i}`).removeClass("empty");
        $(`#quest-${i}`).addClass("fail");
      }
    }
  }
}

// DUBUGGING ONLY
$(document).ready(() => {
  // $.post("/api/lobby/create", { partySize: 4}).then(code => {
  //   lobbyCode = code;
    $.post("/api/lobby/start-game").then(resp => {
      $("#user-name").html(`<br>${resp.name}`);
      lobbyCode = resp.code
        // Game is ready
        $.get(`/api/game/${lobbyCode}/run`).then(data => {
          if(resp.message === "Game Started"){
            if(data){
              displayReveals(30000, data);
              updateInterval = setInterval(() => checkForUpdate(), 1000);
            } 
          }else{
              // If user refresehd the page mid game
              updateInterval = setInterval(() => checkForUpdate(), 1000);
              console.log("Welcome back!");
            }
        }).catch(handleAJAXError); 
    }).catch(handleAJAXError);
  });
// })

// Display AJAX errors in the console
function handleAJAXError(xhr, status, err) {
  console.log(["Error: ", err]);
}