// Emit message to lobby on user connect
function connectHandler() {
  this.nsp.emit("Connection Message", "User has connected");
}

// Emit message to lobby on user disconnect
function disconnectHandler() {
  this.nsp.emit("Disconnection Message", "User has disconnected");
}

// Transmit messages among lobby members
function messageHandler(message) {
  this.nsp.emit("chat message", message);
}

// Initialize socket instance on server and setup framework for lobby socket creation
module.exports = function(server) {
  const io = require("socket.io")(server, {
    transports: ["websocket", "polling"]
  });

  // Setup lobby sockets
  const lobbyNamespaces = io.of(/^\/lobby-[a-zA-Z0-9]+$/);

  // Register the event handlers when a lobby is initialized
  lobbyNamespaces.on("connect", socket => {
    socket.on("connect", connectHandler.bind(socket));
    socket.on("disconnect", disconnectHandler.bind(socket));
    socket.on("chat message", messageHandler.bind(socket));
  });

  return io;
};
