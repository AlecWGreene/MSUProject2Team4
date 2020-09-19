function connectHandler(socket) {
  const lobby = socket.nsp;

  lobby.emit("User has connected");
}

function messageHandler(socket) {}

module.exports = function(http, passport, session) {
  const io = require("socket.io")(http);

  // Authenticate user for socket access
  io.use(session({ secret: "arthur" }));
  io.use(passport.initialize());
  io.use(passport.session());

  // Setup socket authentication middleware
  io.use((socket, next) => {
    if (socket.request.user) {
      return next();
    } else {
      return next(new Error("User is not authenticated"));
    }
  });

  // Setup lobby sockets
  const lobbyNamespaces = io.of(/^\/lobby-[a-zA-Z0-9]+$/);

  // Register event listeners
  lobbyNamespaces.on("connect", connectHandler);
  lobbyNamespaces.on("chat message", messageHandler);

  // Verify user has access to lobby
  lobbyNamespaces.use((socket, next) => {
    /** @todo verify user has access */
    next();
  });

  return io;
}
