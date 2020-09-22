// Emit message to lobby on user connect
function userConnectHandler(data) {
  this.nsp.emit("user connect", data);
}

// Emit message to lobby on user disconnect
function userDisconnectHandler(data) {
  console.log("Disconnected" + JSON.stringify(data));
  console.log(this.nsp);
  this.nsp.emit("user disconnect", data);
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
    socket.on("user connect", userConnectHandler.bind(socket));
    socket.on("disconnect", userDisconnectHandler.bind(socket));
    socket.on("chat message", messageHandler.bind(socket));
  });

  return io;
};
