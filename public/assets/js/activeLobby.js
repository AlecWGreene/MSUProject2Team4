$(document).ready(() => {
    
    let lobbySize = 4;
    let members = ["sebastian,maria,alec"];
    let lobbyID = "A1H4X0P"

    // Add lobby Code to lobby wait room
    $("#lobby-code").text(`Join Code -- ${lobbyID}`);

    $.get("/api/lobby/data")    

        .then(res => {
            console.log(res)
            members = res
        })

        .catch(handleLoginErr);

        function handleLoginErr(err) {
            $("#alert .msg").text(err.responseJSON);
            $("#alert").fadeIn(500);
            console.log(err);
        }

    for(i=0;i<lobbySize;i++) {

        $("#view-participants").append(

            `<li class="list-group-item">
                <div class="row">
                    <div class="col-12 d-flex justify-content-center">
                        <div class="list-group-item list-group-item-action player-names" id="player-name-i">
                            <div class="row">
                                <div class="col-11" id="username-i">
                                    username
                                </div>
                                <div class="col-1" id="add-player-i">
                                    <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-person-plus-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-3a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                                    </svg>
                                </div>
                                <div class="col-1 hide" id="remove-player-i">
                                    <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-person-x" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" d="M8 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm6 5c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10zm1.146-7.85a.5.5 0 0 1 .708 0L14 6.293l1.146-1.147a.5.5 0 0 1 .708.708L14.707 7l1.147 1.146a.5.5 0 0 1-.708.708L14 7.707l-1.146 1.147a.5.5 0 0 1-.708-.708L13.293 7l-1.147-1.146a.5.5 0 0 1 0-.708z"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </li>`
        );
    };
});