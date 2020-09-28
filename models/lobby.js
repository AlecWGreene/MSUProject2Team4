// Creating our User model
module.exports = function(sequelize, DataTypes) {
  const Lobby = sequelize.define("Lobby", {
    lobbyname: {
      type: DataTypes.STRING,
      allowNull: false
    },

    idhash: {
      type: DataTypes.STRING
    },

    userhash: {
      type: DataTypes.STRING
    },

    creatorid: {
      type: DataTypes.INTEGER
    },

    ingame: {
      type: DataTypes.BOOLEAN
    },

    maxusers: {
      type: DataTypes.INTEGER
    },

    numusers: {
      type: DataTypes.INTEGER
    },

    numready: {
      type: DataTypes.STRING
    }
  });

  return Lobby;
};
