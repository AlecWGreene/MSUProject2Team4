// Creating our User model
module.exports = function(sequelize, DataTypes) {
  const Lobby = sequelize.define("Lobby", {
    lobbyName: {
      type: DataTypes.STRING,
      allowNull: false
    },

    members: {
      type: DataTypes.STRING,

      allowNull: true,

      defaultValue: null
    },

    idHash: {
      type: DataTypes.STRING,

      // allowNull: false,

      // unique: true

      allowNull: true,

      defaultValue: null
    }
  });

  return Lobby;
};
