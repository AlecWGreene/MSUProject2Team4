$(document).ready(() => {

    // Toggle Search Radius Input Feild 
    $("#lobby-size").on("change", function() {

        // this will contain a reference to the checkbox   
        if (!isNaN(this.value) && parseInt(this.value) > 4) {

            // the checkbox is now checked, remove "hide" class
            $("#player-select-check").removeClass("hide");

        } else {

            // the checkbox is now no longer checked, add "hide" class
            $("player-select-check").addClass("hide");

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
        
        const state = $(this).data("state");

        // let url;
    
        // let request;
    
        if(state == false){
    
            state = true;
    
        }

        data = {

            type: "PUT",
            data: newState
    
        };
    
        // Send the POST or PUT request depending on state
        $.post(url, request)
        .then(function() {
            
            // Reload the page to get the updated list
            location.reload();
    
        });
      
    });
  
});
    