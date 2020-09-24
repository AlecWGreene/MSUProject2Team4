// Creating our User model
module.exports = function(sequelize, DataTypes) {
  const Lobby = sequelize.define("Lobby", {
    // The email cannot be null, and must be a proper email before creation

    members: {
      type: DataTypes.STRING,

      allowNull: false,

      unique: true
    },

    IdHash: {
      type: DataTypes.STRING,

      allowNull: false,

      unique: true
    },

    LobbyName: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  return Lobby;
};
