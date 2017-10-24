/* global io */

let socket;
let canvas;
let ctx;

let updated = false;
let hash;
let players = {};

// keyboard stuff
const myKeys = {
  KEYBOARD: {
    KEY_W: 87,
    KEY_A: 65,
    KEY_S: 83,
    KEY_D: 68,
  },
  keydown: [],
};

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

// returns an object { x: var, y: var }
const lerpPos = (pos0, pos1, alpha) => ({
  x: ((1 - alpha) * pos0.x) + (alpha * pos1.x),
  y: ((1 - alpha) * pos0.y) + (alpha * pos1.y),
});

// move update to keydown? to remove request animation frame
const updateMovement = () => {
  const user = players[hash];
  updated = false;

  user.prevPos = user.pos;

  if (myKeys.keydown[myKeys.KEYBOARD.KEY_W] === true) {
    user.destPos.y += -2;
    updated = true;
    console.log(user.destPos);
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_A] === true) {
    user.destPos.x += -2;
    updated = true;
    console.log(user.destPos);
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_S] === true) {
    user.destPos.y += 2;
    updated = true;
    console.log(user.destPos);
  }
  if (myKeys.keydown[myKeys.KEYBOARD.KEY_D] === true) {
    user.destPos.x += 2;
    updated = true;
  console.log(user.destPos);
  }

  // prevent player from going out of bound
  user.destPos.x = clamp(user.destPos.x, 0, 500 - user.width);
  user.destPos.y = clamp(user.destPos.y, 0, 500 - user.height);

  user.alpha = 0.05;

  // if this client's user moves, send to server to update server
  if (updated === true) {
    socket.emit('updatePlayer', {
      pos: user.pos,
      prevPos: user.prevPos,
      destPos: user.destPos,
      alpha: user.alpha,
    });
  }
};

// draw players
const drawPlayers = () => {
  const keys = Object.keys(players);

  for (let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];

    // lerp players
    if (player.alpha < 1) player.alpha += 0.05;

    player.pos = lerpPos(player.prevPos, player.destPos, player.alpha);

    // ignores this clients object to draw it last
    if (keys[i] !== hash) {
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(player.pos.x, player.pos.y, player.width, player.height);
    }
  }

  const user = players[hash];
  // draw clients player
  ctx.fillStyle = 'rgb(100, 100, 150)';
  ctx.fillRect(user.pos.x, user.pos.y, user.width, user.height);
};

const draw = () => {
  updateMovement();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayers();

  window.requestAnimationFrame(draw);
};

// called when server sends update update user pos?
const update = (data) => {
  // list of players hash from server
  const keys = Object.keys(data.players);

  // loop through players to update
  for (let i = 0; i < keys.length; i++) {
    const player = players[keys[i]];

    // if player doesn't exist in players object - add player
    // else if player exist and last update is less than server's - update the player
    // else - do nothing
    if (!player) {
      players[keys[i]] = data.players[keys[i]];
    } else if (player && player.lastUpdate < data.players[keys[i]].lastUpdate) {
      const updatePlayer = data.players[keys[i]];

      player.lastUpdate = updatePlayer.lastUpdate;
      player.prevPos = updatePlayer.prevPos;
      player.destPos = updatePlayer.destPos;
      player.alpha = 0.05;
    }
  }
};

const setupSocket = () => {
  socket.emit('join');

  socket.on('update', update);

  // get other clients data from server
  socket.on('initData', (data) => {
    players = data.players;
    hash = data.hash;

    window.requestAnimationFrame(draw);
  });
};

const init = () => {
  socket = io.connect();
  canvas = document.querySelector('#main');
  ctx = canvas.getContext('2d');

  canvas.setAttribute('width', 500);
  canvas.setAttribute('height', 500);

  setupSocket();

  // event listeners
  window.addEventListener('keydown', (e) => {
    // console.log(`keydown: ${e.keyCode}`);
    myKeys.keydown[e.keyCode] = true;
  });

  window.addEventListener('keyup', (e) => {
    // console.log(`keyup: ${e.keyCode}`);
    myKeys.keydown[e.keyCode] = false;
  });
};

window.onload = init;

window.onunload = () => {
  socket.emit('disconnect');
};
