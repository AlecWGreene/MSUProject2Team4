$(document).ready(() => {
    // Hide the create/join lobby buttons from nav bar 
    $("#create-lobby").removeClass("hide");
    $("#join-lobby").addClass("hide");

    let lobbiesInfo = {};

    $.get("/lobby/all")    

        .then(res => {

            lobbiesInfo = res;

            for(i=0;i<lobbiesInfo.length;i++) {
                $(".lobby-select").append(
                    ` <li class="list-group-item">
                        <div class="row">
                            <div class="col-12 d-flex justify-content-center">
                                <div class="list-group-item list-group-item-action lobby-items" id="${i}-${lobbiesInfo[i].idhash}-lobbyitems">
                                    <div class="row">
                                        <div class="col-11 lobby-name" id="${i}-${lobbiesInfo[i].idhash}-lobbyname">
                                            ${lobbiesInfo[i].lobbyname}
                                        </div>
                                        <div class="col-1 add-lobby" id="${i}-${lobbiesInfo[i].idhash}-addlobby">
                                            <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-person-plus-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.5-3a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z"/>
                                            </svg>
                                        </div>
                                        <div class="col-1 hide join-lobby" id="${i}-${lobbiesInfo[i].idhash}-joinlobby">
                                            <svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-arrow-right-circle-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-11.5.5a.5.5 0 0 1 0-1h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5z"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>`
                );
            };
        })
        .catch(handleLoginErr);
        function handleLoginErr(err) {
            $("#alert .msg").text(err.responseJSON);
            $("#alert").fadeIn(500);
            console.log(err);
        };

        let selectLast;

    $(".lobby-select").on("click", function() {
        event.preventDefault();
        // let selectIdHash = this.children[0].children[0].children[0].children[0].id;
        // let selectTargIdHash = event.target.id;
        let select = parseInt(event.target.id.split("-")[0])
        let idHash = event.target.id.split("-")[1]
        // && select !== selectLast
        if(idHash === lobbiesInfo[select].idhash && select !== selectLast) {
            $(".join-lobby").addClass("hide");
            $(".add-lobby").removeClass("hide");
            
            $(`#${select}-${idHash}-addlobby`).addClass("hide");
            $(`#${select}-${idHash}-joinlobby`).removeClass("hide");
            selectLast = select;
        }else if(select === selectLast) {
            joinlobby(idHash);
        }else{
            selectLast = "";
            $(`#${select}-${idHash}-addlobby`).removeClass("hide");
            $(`#${select}-${idHash}-joinlobby`).addClass("hide");
        };
    });

    function joinlobby(idHash){
        $.post(`/api/lobby/join/${idHash}`)
        .then(res => console.log(res))

        .catch(handleLoginErr);

        function handleLoginErr(err) {
            $("#alert .msg").text(err.responseJSON);
            $("#alert").fadeIn(500);
            console.log(err);
        }
    };
});