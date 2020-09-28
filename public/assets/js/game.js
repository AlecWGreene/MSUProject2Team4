// =============== DOM References ===============
const $modalDiv = $("#modal-container");

// =============== Modal graphic methods ===============
function getModalTemplate() {
  // Create wrapper div
  const temp = $("<div>")
    .attr("id", "game-modal")
    .addClass("game-modal");

  // Create section divs
  const modalHeader = $("<div>").addClass("modal-header");
  const modalBody = $("<div>").addClass("modal-body");
  const modalButtonDiv = $("<div>").addClass("modal-buttonDiv");
  const modalProgressBar = $("<div>").addClass("modal-progressBar");

  // Create a progressbar
  const progressbar = $("<div>").addClass("progress");
  progressbar.append(
    $("<div>")
      .addClass("progress-bar")
      .css("width", "75%")
  );

  // Append the progressbar
  modalProgressBar.append(progressbar);

  // Append the sections
  temp
    .append(modalHeader)
    .append(modalBody)
    .append(modalButtonDiv)
    .append(modalProgressBar);

  return temp;
}

// Get a modal for non-interactive users
function getWaitModal(gamePhase) {
  const modal = getModalTemplate();

  $($(modal).children()[0]).text(`Waiting on ${gamePhase}`);

  return modal;
}

// Get modal for selecting a party
function getPartySelectModal(userArray) {
  const modal = getModalTemplate();

  // Set the header
  $($(modal).children()[0]).text("Select a party");

  // Set the body
  const choiceBody = $("<ul>").addClass("selection-list");
  for (const user of userArray) {
    const userItem = $("<li>")
      .addClass("selection-item")
      .attr("data-id", user.id)
      .text(user.name);
    choiceBody.append(userItem);
  }
  $($(modal).children()[1]).append(choiceBody);

  // Set the buttons
  const finishBtn = $("<button>")
    .addClass("modal-button")
    .attr("id", "finish-button")
    .text("Finish");
  const resetBtn = $("<button>")
    .addClass("modal-button")
    .attr("id", "reset-button")
    .text("Reset");
  $($(modal).children()[2])
    .append(finishBtn)
    .append(resetBtn);

  return modal;
}

// Get modal for yes or no votes on a proposed party
function getPartyValidVoteModal(message) {
  const modal = getModalTemplate();

  // Set the header
  $($(modal).children()[0]).text("Do you approve this party?");

  // Set the body
  $($(modal).children()[1]);

  // Set the buttons
  const vetoBtn = $("<button>")
    .addClass("modal-button")
    .attr("id", "veto-button")
    .text("Veto");
  const approveBtn = $("<button>")
    .addClass("modal-button")
    .attr("id", "approve-button")
    .text("Approve");
  $($(modal).children()[2])
    .append(vetoBtn)
    .append(approveBtn);

  return modal;
}

// Get modal for passing or failing quests
function getPartyPassVoteModal() {
  const modal = getModalTemplate();

  // Set the header
  $($(modal).children()[0]).text(
    "Minion of Mordred, will you sabotage this quest?"
  );

  // Set the body
  $($(modal).children()[1]);

  // Set the buttons
  const failBtn = $("<button>")
    .addClass("modal-button")
    .attr("id", "fail-button")
    .text("Fail");
  const passBtn = $("<button>")
    .addClass("modal-button")
    .attr("id", "pass-button")
    .text("Pass");
  $($(modal).children()[2])
    .append(failBtn)
    .append(passBtn);

  return modal;
}

function addEventHandlers(modalName) {
  // Register event handlers
  switch (modalName) {
  case "Party Select":
    $(".selection-item").on("click", partySelectionItemToggle);
    $("#finish-button").on("click", partySelectionFinishHandler);
    $("#reset-button").on("click", partySelectionResetHandler);
  case "Party Valid Vote":
      $("#veto-button").on("click", partyValidVoteVetoHandler);
    $("#approve-button").on("click", partyValidVoteApproveHandler);
    case "Party Pass Vote":
    $("#fail-button").on("click", partyPassVoteFailHandler);
    $("#pass-button").on("click", partyPassVotePassHandler);
  }
}

// =============== Runtime ===============

function test() {
  $modalDiv.append(getModalTemplate());
}
