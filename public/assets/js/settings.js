$(document).ready(() => {
    
    // Hide the create/join lobby buttons from nav bar 
    $("#create-lobby").addClass("hide");
    $("#join-lobby").addClass("hide");

    let selectLast;
    let type;

    $(".settings").on("click", function() {
        event.preventDefault();
        if(event.target.id === "change-username" || event.target.id === "change-password" || event.target.id === "change-email") {
            if (event.target.id === "change-password") {
                type = "password"
            }
            $(".update").remove();
            if(selectLast !== event.target.id) {
                $(`.${event.target.id}`).append(
                    `<div class="col-lg-10 mt-3 gold update" style="background-color: #00000049; border-radius: 5px;">
                        <form>
                            <div class="form-group text-center">
                            <label for="input-${event.target.id}">New ${event.target.id.split("-")[1]}</label>
                            <input type="text" class="form-control text-center" id="input-${event.target.id}" placeholder="Enter new ${event.target.id.split("-")[1]}">
                            </div>
                            <button type="submit" class="btn btn-block gradient gold-square" id="submit-${event.target.id}">Update</button>
                            </br>
                        </form>
                    </div>`
                );
                selectLast = event.target.id;
            }else{
                selectLast = "";
            }
        }else if(event.target.id === "submit-change-username" || event.target.id === "submit-change-password" || event.target.id === "submit-change-email") {
            let action = event.target.id;
            let inputVal = event.target.parentElement.children[0].children[1].value;
            $.ajax({
                method: "PUT",
                url: "/api/settings",
                data: { 
                    input: inputVal, 
                    action: action 
                }
            }).then(res => {
                let userData = ` <i>changed</i> > ${res.data[Object.keys(res.data)[0]]}`;
                if(Object.keys(res.data)[0] === "password") {
                    userData = ` <i>changed</i> `
                }
                $(".update").remove();
                $(".feedback").append(`<p> ${Object.keys(res.data)[0]}: ${userData} </p>`);
            })
            .catch(handleLoginErr);
            function handleLoginErr(err) {
                $("#alert .msg").text(err.responseJSON);
                $("#alert").fadeIn(500);
                console.log(err);
            }
        }
    });   
});