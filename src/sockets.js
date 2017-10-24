const xxh = require('xxhashjs');
const Player = require('./player.js');

const players = {};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', () => {
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    socket.join('room1');
    socket.hash = hash;
    players[hash] = new Player(hash);

    socket.emit('initData', {
      players,
      hash,
    });
  });
};

const onMsg = (sock) => {
  const socket = sock;

  socket.on('updatePlayer', (data) => {
    players[socket.hash].update(data);
  });
};

const onDisconnect = (sock, io) => {
  const socket = sock;

  delete players[socket.hash];

  io.sockets.in('room1').emit('disconnect', socket.hash);

  socket.leave('room1');
};

const handleSockets = (ioServer) => {
  const io = ioServer;

  io.sockets.on('connection', (socket) => {
    onJoined(socket, io);
    onMsg(socket, io);
    onDisconnect(socket, io);
  });
};

module.exports = {
  handleSockets,
};
