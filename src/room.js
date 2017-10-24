const Player = require('./player.js');
const utils = require('./utils.js');

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

        player.velocity.y += 0.1;
        player.velocity.y = utils.clamp(player.velocity.y, -10, 4);

        player.destPos.y += player.velocity.y;

        if (player.pos.y >= 450) {
          player.grounded = true;
          player.destPos.y = utils.clamp(player.destPos.y, 0, 450);
        }
      }
    }
  }
}

module.exports = Room;
