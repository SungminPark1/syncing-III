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

      player.lastUpdate = new Date().getTime();

      // if jumping or in the air 
      if (!player.grounded || player.velocity < 0) {
        player.prevPos = player.pos;

        player.velocity.y += 0.1;
        player.velocity.y = utils.clamp(player.velocity.y, -5, 3);

        // temporarily let destPos y go beyond bound 
        // prevents lerp slowing down when close to ground
        player.destPos.y += player.velocity.y;

        // when player pos is >= bottom and y velocity is >= 0 - set grounded to true
        if (player.pos.y >= 450 && player.velocity.y >= 0) {
          player.grounded = true;
        }
      } else {
        // prevent player from falling out of bound
        player.prevPos.y = utils.clamp(player.prevPos.y, 0, 450);
        player.destPos.y = utils.clamp(player.destPos.y, 0, 450);
      }

      // prevent player from walking out of bound
      player.prevPos.x = utils.clamp(player.prevPos.x, 0, 450);
      player.destPos.x = utils.clamp(player.destPos.x, 0, 450);
    }
  }
}

module.exports = Room;
