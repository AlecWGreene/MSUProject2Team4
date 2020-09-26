$(document).ready(() => {

    let lobbySize = 4;
    let selectArray = [];

    // Toggle Search Radius Input Feild 
    $("#lobby-size").on("keypress", function() {

        // only respond to enter key
        if(event.keyCode === 13){
            event.preventDefault(); // Ensure it is only this code that run
            // this will contain a reference to the checkbox   
            if (!isNaN(this.value) && parseInt(this.value) >= 4) {
                // the checkbox is now checked, remove "hide" class
                $("#player-select-check").removeClass("hide");
                lobbySize = parseInt(this.value);
            } else {
                // the checkbox is now no longer checked, add "hide" class
                $("#player-select-check").addClass("hide");
                // the checkbox is now no longer checked, add "hide" class
                $("#player-select-form").addClass("hide");
            }
        }

    });

    // Toggle Search Radius Input Feild 
    $("#invite-players").on("change", function() {

        // this will contain a reference to the checkbox   
        if (this.checked) {

            // the checkbox is now checked, remove "hide" class
            $("#player-select-form").removeClass("hide");

        } else {

            // the checkbox is now no longer checked, add "hide" class
            $("#player-select-form").addClass("hide");

        }

    });

    $(".player-names").on("click", function(event) {
  
        const id = $(this).data("id");

        let duplicate = false;

        // toggle - if id was selected twice, then remove it from selectArray
        for(let i = 0; i < selectArray.length; i++) {
            if(selectArray[i].id === id) {
                selectArray.splice(i,1)
                duplicate = true;
            }
        };

        if(selectArray.length === 0 && !duplicate) {

            // add player to selectArray if it is empty
            selectArray.push({ id: id });

            renderPlayerBtns(selectArray);

        }else if(selectArray.length === lobbySize){

            // FIFO player selection removal when lobby is at capacity SelectArray > lobbysize 
            selectArray.shift();
            selectArray.push({ id: id });

            renderPlayerBtns(selectArray);
                
        }else if(duplicate) {

            renderPlayerBtns(selectArray);
            
        }else{
            // add player to selectArray - duplicates are removed in the following for loop
            selectArray.push({ id: id });

            renderPlayerBtns(selectArray);
        }

        function renderPlayerBtns(selectArray) {

            playersAvail = $("#player-select")[0].childElementCount;

            for(let i = 0; i < playersAvail; i++) {
                btnDivEl = $("#player-name-" + i)
                iconAddDivEl = $("#add-player-" + i)
                iconRemDivEl = $("#remove-player-" + i)
                // remove color from button
                // btnDivEl.removeClass("green-btn")
                btnDivEl.removeClass("btn-success")
                // hide remove icon
                iconRemDivEl.addClass("hide")
                // un-hide add icon
                iconAddDivEl.removeClass("hide")

                for(let j = 0; j < selectArray.length; j++) {
                    if(selectArray[j].id === btnDivEl.data("id")) {
                        // add color from button
                        // btnDivEl.addClass("green-btn");
                        btnDivEl.addClass("btn-success");
                        // hide add icon
                        iconAddDivEl.addClass("hide")
                        // un-hide remove icon
                        iconRemDivEl.removeClass("hide")
                    }
                };
            };
        }
    });

    // $("#create-lobby").on("click", function(event) {
    //     // lobbySize
    //     // selectArray
    //     $("#invite-players")[0].checked
    //     $("#lobby-name")[0].value
        
    // });

    // $.get("/api/user_data").then(data => {
    //     $(".user").text(data.username);
    // });

    $("form.create-lobby").on("submit", event => {
        event.preventDefault();
        const LobbyData = {
            lobbyName: $("#lobby-name")[0].value,
            members: selectArray,
            idHash: passwordInput.val().trim()
        };
    
        if (!LobbyData.lobbyName || !LobbyData.members || !LobbyData.idHash) {
          return;
        }
        // If we have an email and password, run the signUpUser function
        createLobby(LobbyData.lobbyName, LobbyData.members, LobbyData.idHash);
        usernameInput.val("");
        emailInput.val("");
        passwordInput.val("");
    });
    
    // Does a post to the signup route. If successful, we are redirected to the members page
    // Otherwise we log any errors
    function createLobby(username, email, password) {
        $.post("/api/lobby/create", {
            username: username,
            email: email,
            password: password
        })
            .then(() => {
            window.location.replace("/home");
            // If there's an error, handle it by throwing up a bootstrap alert
            })
            .catch(handleLoginErr);
    }

    function handleLoginErr(err) {
        $("#alert .msg").text(err.responseJSON);
        $("#alert").fadeIn(500);
    }
});

// // Send the POST or PUT request depending on state
// $.get("/api/lobby", pageState)
//     .then(() => {
//         // Reload the page to get the updated list
//         location.reload();
//     })
//     .fail(err => {
//         // If there's an error, log the error
//         console.log(err);
//     });