// const utils = require('./utils.js');

class Player {
  constructor(hash) {
    this.hash = hash;
    this.lastUpdate = new Date().getTime();
    this.pos = { x: 250, y: 250 };
    this.prevPos = this.pos;
    this.destPos = this.pos;
    this.alpha = 0;
    this.width = 50;
    this.height = 50;
  }

  update(data) {
    this.lastUpdate = new Date().getTime();
    this.pos = data.pos;
    this.prevPos = data.prevPos;
    this.destPos = data.destPos;
    this.alpha = data.alpha;
  }
}

module.exports = Player;
