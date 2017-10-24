const utils = require('./utils.js');

class Player {
  constructor(hash) {
    this.hash = hash;
    this.lastUpdate = new Date().getTime();
    this.pos = { x: utils.getRandomInt(451), y: 0 };
    this.prevPos = { ...this.pos };
    this.destPos = { ...this.pos };
    this.velocity = { x: 0, y: 0 };
    this.alpha = 0;
    this.width = 50;
    this.height = 50;
    this.grounded = false;
    this.jump = false;
  }

  update(data) {
    this.lastUpdate = new Date().getTime();
    this.pos = data.pos;
    this.prevPos = data.prevPos;
    this.destPos = data.destPos;
    this.alpha = data.alpha;

    if (this.grounded && data.jump) {
      this.velocity.y = -5;
      this.grounded = false;
    } else {
      this.jump = false;
    }
  }
}

module.exports = Player;
