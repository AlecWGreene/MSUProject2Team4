// Create event handlers

// --------------- Party Selection Modal Handlers ---------------
function partySelectionItemToggle(event) {

    let target = $(event.target);
    
    if (target.hasClass("selection-item-active")) {

        target.removeClass("selection-item-active")

    }else{

        target.addClass("selection-item-active")

    }

}

function partySelectionFinishHandler(event) {

    let userArray = Object.values($(".selection-item")).splice(0,Object.values($(".selection-item")).length - 4).map(item => $(item).data("id"));

    console.log(userArray);

  $.post("/api/game/aaaa/partySelection", {
    userArray: userArray 
  })
    .then(() => {
      // If there's an error, log the error
    })
    .fail(err => {
      console.log(err);
    });
}

function partySelectionResetHandler(event) {

}

// --------------- Party Valid Vote Modal Handlers ---------------
function partyValidVoteVetoHandler(event) {

}

function partyValidVoteApproveHandler(event) {

}

// --------------- Party Pass Vote Modal Handlers ---------------
function partyPassVoteFailHandler(event) {

}

function partyPassVotePassHandler(event) {

}