const Player = require('./player.js');

class Room {
  constructor(roomName) {
    this.room = roomName;
    this.players = {};
  }

  addPlayer(hash) {
    this.players[hash] = new Player(hash);
  }

  update() {
    const keys = Object.keys(this.players);

    for (let i = 0; i < keys.length; i++) {
      const player = this.players[keys[i]];

      if (!player.grounded) {
        player.lastUpdate = new Date().getTime();
        player.prevPos = player.pos;
        player.destPos.y++;

        if (player.destPos.y >= 450) {
          player.grounded = true;
        }
      }
    }
  }
}

module.exports = Room;
