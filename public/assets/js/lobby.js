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

    $("form.create-lobby").on("submit", event => {
        event.preventDefault();
        // const LobbyData = {
        //     name: $("#lobby-name")[0].value,
        // };
    
        // if (!LobbyData.lobbyName || !LobbyData.members || !LobbyData.idHash) {
        //   return;
        // }
        // If we have an email and password, run the signUpUser function
        // createLobby();

        // function createLobby() {
            // $.ajax({
            //     type: "POST",
            //     url: "/api/lobby/create",
            //     data: JSON.stringify({
            //         partySize: 4
            //     }),
            //     dataType: "json",
            //     contentType: "application/json",                
            // })
            //     .then(() => {
            //         // handle error
            //     })
            //     .catch(handleLoginErr);
        // }

        $.post("http://localhost:8080/api/lobby/create",{
            partySize: 4
        }).then(res => console.log(res));
    
        function handleLoginErr(err) {
            $("#alert .msg").text(err.responseJSON);
            $("#alert").fadeIn(500);
            console.log(err);
        }
        // LobbyData.lobbyName, LobbyData.members, LobbyData.idHash
        // usernameInput.val("");
        // emailInput.val("");
        // passwordInput.val("");
    });
    
});