// DOM References
const $chatForm = $("#chat-form");
const $chatInput = $("#chat-input"); 
const $chatDisplay = $("#chat-messages");

// Connect to lobby namespace
const lobbyKey = "aaaa";
const socket = io(`/lobby-${lobbyKey}`);

// Passes information to socket
function chatSubmitHandler(event) {
  event.preventDefault();
  socket.emit("chat message", $chatInput.val());
  $chatInput.val("");
  return false;
}

// Display a message when a lobby member connects
function connectionHandler(data) {
  $chatDisplay.append($("<li>").text(data.user + " has connected"));
}

// Display a message when a lobby member disconnects
function disconnectionHandler(data) {
  $chatDisplay.append($("<li>").text(data.user + " has disconnected"));
}

// Sends a user's message to lobby
function messageHandler(data) {
  $chatDisplay.append($("<li>").text(data.message));
}

// Add event listeners on disconnect and emit a connection message
socket.on("connect", () => {
  $chatForm.on("submit", chatSubmitHandler);
  socket.on("chat message", messageHandler);
  socket.on("user connect", connectionHandler);
  socket.on("user leave", disconnectionHandler);
  socket.emit("user connect", {
    user: "Alec"
  });
});

// Remove event listenrs on disconnect
socket.on("disconnect", () => {
  socket.removeAllListeners();
});
