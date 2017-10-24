'use strict';

/* global io */

var socket = void 0;
var canvas = void 0;
var ctx = void 0;

var updated = false;
var hash = void 0;
var players = {};

// keyboard stuff
var myKeys = {
  KEYBOARD: {
    KEY_W: 87,
    KEY_A: 65,
    KEY_S: 83,
    KEY_D: 68
  },
  keydown: []
};

var clamp = function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
};

// returns an object { x: var, y: var }
var lerpPos = function lerpPos(pos0, pos1, alpha) {
  return {
    x: (1 - alpha) * pos0.x + alpha * pos1.x,
    y: (1 - alpha) * pos0.y + alpha * pos1.y
  };
};

// move update to keydown? to remove request animation frame
var updateMovement = function updateMovement() {
  var user = players[hash];
  updated = false;

  user.prevPos = user.pos;

  if (myKeys.keydown[myKeys.KEYBOARD.KEY_W] === true) {
    user.destPos.y += -2;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_A] === true) {
    user.destPos.x += -2;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_S] === true) {
    user.destPos.y += 2;
    updated = true;
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_D] === true) {
    user.destPos.x += 2;
    updated = true;
  }

  // prevent player from going out of bound
  user.destPos.x = clamp(user.destPos.x, 0, 500 - user.width);
  user.destPos.y = clamp(user.destPos.y, 0, 500 - user.height);

  user.alpha = 0.05;

  // if this client's user moves or is falling from gravity - send to server to update server
  if (updated === true || !user.grounded) {
    socket.emit('updatePlayer', {
      pos: user.pos,
      prevPos: user.prevPos,
      destPos: user.destPos,
      alpha: user.alpha
    });
  }
};

// draw players
var drawPlayers = function drawPlayers() {
  var keys = Object.keys(players);

  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];

    // lerp players
    if (player.alpha < 1) player.alpha += 0.05;

    player.pos = lerpPos(player.prevPos, player.destPos, player.alpha);

    // ignores this clients object to draw it last
    if (keys[i] !== hash) {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(player.pos.x, player.pos.y, player.width, player.height);
    }
  }

  var user = players[hash];
  // draw clients player
  ctx.fillStyle = 'rgb(100, 100, 150)';
  ctx.fillRect(user.pos.x, user.pos.y, user.width, user.height);
};

var draw = function draw() {
  updateMovement();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayers();

  window.requestAnimationFrame(draw);
};

// called when server sends update update user pos?
var update = function update(data) {
  // list of players hash from server
  var keys = Object.keys(data.players);

  // loop through players to update
  for (var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];

    // if player doesn't exist in players object - add player
    // else if player exist and last update is less than server's - update the player
    // else - do nothing
    if (!player) {
      players[keys[i]] = data.players[keys[i]];
    } else if (player && player.lastUpdate < data.players[keys[i]].lastUpdate) {
      var updatePlayer = data.players[keys[i]];

      player.lastUpdate = updatePlayer.lastUpdate;
      player.prevPos = updatePlayer.prevPos;
      player.destPos = updatePlayer.destPos;
      player.alpha = 0.05;

      if (keys[i] !== hash) {
        // console.log(player.alpha);
      }
    }
  }
};

var setupSocket = function setupSocket() {
  socket.emit('join');

  socket.on('update', update);

  // get other clients data from server
  socket.on('initData', function (data) {
    players = data.players;
    hash = data.hash;

    window.requestAnimationFrame(draw);
  });
};

var init = function init() {
  socket = io.connect();
  canvas = document.querySelector('#main');
  ctx = canvas.getContext('2d');

  canvas.setAttribute('width', 500);
  canvas.setAttribute('height', 500);

  setupSocket();

  // event listeners
  window.addEventListener('keydown', function (e) {
    // console.log(`keydown: ${e.keyCode}`);
    myKeys.keydown[e.keyCode] = true;
  });

  window.addEventListener('keyup', function (e) {
    // console.log(`keyup: ${e.keyCode}`);
    myKeys.keydown[e.keyCode] = false;
  });
};

window.onload = init;

window.onunload = function () {
  socket.emit('disconnect');
};
