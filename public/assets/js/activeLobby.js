$(document).ready(() => {
    
    // Hide the create/join lobby buttons from nav bar 
    $("#create-lobby").addClass("hide");
    $("#join-lobby").addClass("hide");

    let lobbyData = {};

    // call updatedForecast function
    updatelobbyData()

    // set routine timeinterval of 1 sec to call updatelobbyData function - periodically update lobbyData
    /** @todo monitor memory leak */
    setInterval(updatelobbyData,1000); 

    function updatelobbyData(){

        $.get("/api/lobby/data")    
            .then(res => {

                lobbyData = {
                    lobbyName: res.name,
                    lobbyID: res.code,
                    members: res.users,
                    numReady: res.numReady,
                    lobbyReady: res.lobbyReady,
                    maxUsers: res.maxUsers,
                    host: res.hostid,
                    user: res.currentid
                }

                // Add lobby Code to lobby wait room
                $(".start-game").empty();

                renderUsers(lobbyData);
                updateLobbyReadyStatus(lobbyData);
            })

            .catch(handleLoginErr);

            function handleLoginErr(err) {
                $("#alert .msg").text(err.responseJSON);
                $("#alert").fadeIn(500);
                console.log(err);
            }

            function renderUsers(data) {
                if(data.maxUsers === data.numReady.length && data.host === data.user) {
                    $(".start-game").append(`<button type="submit" class="btn col-5 gradient gold-square empty pass fail" id="start">Start ${lobbyData.lobbyName}</button>`);
                }else{
                    $(".start-game").append(`<h5 for="lobby-name" id="lobby-name">${lobbyData.lobbyName}</h5>`);
                };
                $("#view-participants").empty()
                // for(i=0;i<lobbySize;i++) {
                for(i=0;i<data.maxUsers;i++) {
                    let id = "";
                    let username = "";
                    if(data.members[i] === undefined){
                        username = "waiting for players...";
                        id = "waiting";
                    }else{
                        username = data.members[i].username;
                        id = lobbyData.members[i].id;
                    }
                    $("#view-participants").append(
                        `<li class="list-group-item">
                            <div class="row">
                                <div class="col-12 d-flex justify-content-center">
                                    <div class="list-group-item list-group-item-action player-names" id="name-player-${id}">
                                        <div class="row">
                                            <div class="col-11" id="username-player-${id}">
                                                ${username}
                                            </div>
                                            <div class="col-1" id="pending-player-${id}">
                                                <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-person-plus-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-3a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                                                </svg>
                                            </div>
                                            <div class="col-1 hide" id="ready-player-${id}">
                                                <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-person-check-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9.854-2.854a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>`
                    );
                };
            }  
            
        let selectLast;

        $("#view-participants").on("click", function() {
            event.preventDefault();
            
            let select = parseInt(event.target.id.split("-")[2]);
            // let userId = select + 1;
            
            if(select == lobbyData.user && selectLast !== select) {
         
                $(`#ready-player-${select}`).addClass("hide");
                $(`#pending-player-${select}`).removeClass("hide");
                
                $(`#pending-player-${select}`).addClass("hide");
                $(`#ready-player-${select}`).removeClass("hide");

                selectLast = select;

                updateReadyStatus();

            }else{
                $(`#pending-player-${select}`).removeClass("hide");
                $(`#ready-player-${select}`).addClass("hide");
                
                selectLast = "";
            };
            
        });

        function updateLobbyReadyStatus(data) {
          $("#view-participants").children().each((i, element) => {
            const id = $($($($(element).children()[0]).children()[0]).children()[0]).attr("id").split("-")[2];
            const isMatch = data.numReady.filter(readyMember => readyMember.id == id);
            if(isMatch.length > 0){
                $(`#pending-player-${id}`).addClass("hide");
                $(`#ready-player-${id}`).removeClass("hide");
            } else {
                $(`#ready-player-${id}`).addClass("hide");
                $(`#pending-player-${id}`).removeClass("hide");
            }
          });
        }

        function updateReadyStatus() {
            $.post("/api/lobby/ready-up")
            .then(res => console.log(res))

            .catch(handleLoginErr);

            function handleLoginErr(err) {
                $("#alert .msg").text(err.responseJSON);
                $("#alert").fadeIn(500);
                console.log(err);
            }
        }

        $(".start-game").on("click", function() {
            event.preventDefault();

            window.location.pathname = "/game";
        });
    };
});