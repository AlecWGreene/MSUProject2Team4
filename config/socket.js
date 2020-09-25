// Emit message to lobby on user connect
function userConnectHandler() {
  this.nsp.emit("user connect", {
    user: this.request.session.passport.user
  });
}

// Emit message to lobby on user disconnect
function userDisconnectHandler() {
  this.nsp.emit("user disconnect", {
    user: this.request.session.passport.user
  });
}

// Transmit messages among lobby members
function messageHandler(chatMessage) {
  this.nsp.emit("chat message", {
    user: this.request.session.passport.user,
    message: chatMessage,
    timeStamp:
      (new Date().getHours() % 12) +
      ":" +
      new Date().getMinutes().toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false
      })
  });
}

// Initialize socket instance on server and setup framework for lobby socket creation
module.exports = function(server, middleware) {
  const io = require("socket.io")(server, {
    transports: ["websocket", "polling"]
  });

  // Register the middleware for the socket
  io.use((socket, next) => {
    middleware(socket.request, {}, next);
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
