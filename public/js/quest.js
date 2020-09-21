// DOM References
const $chatForm = $("#chat-form");
const $chatInput = $("#chat-input"); 
const $chatDisplay = $("#chat-messages");

// Connect to lobby namespace
const socket = io("/lobby-aaaa");

// Passes information to socket
function chatSubmitHandler(event) {
  event.preventDefault();
  socket.emit("chat message", $chatInput.val());
  $chatInput.val("");
  return false;
}

// Sends message to lobby
function messageHandler(message) {
  $chatDisplay.append($("<li>").text(message));
}

// Add event listeners
socket.on("connect", () => {
  $chatForm.on("submit", chatSubmitHandler);
  socket.on("chat message", messageHandler);
});
