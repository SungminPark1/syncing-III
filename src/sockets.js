const xxh = require('xxhashjs');
const Room = require('./room.js');

const rooms = {};

const updateRoom = (room, io) => {
  rooms[room].update();

  const { players, dt } = rooms[room];
  io.sockets.in(room).emit('update', {
    players,
    dt,
  });
};

const onJoined = (sock, io) => {
  const socket = sock;

  socket.on('join', () => {
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    socket.join('room1');

    // create room if it doesn't exist
    if (!rooms.room1) {
      rooms.room1 = new Room('room1');

      rooms.room1.interval = setInterval(() => {
        updateRoom('room1', io);
      }, 1000 / 60);
    }

    socket.hash = hash;
    rooms.room1.addPlayer(hash);

    socket.emit('initData', {
      players: rooms.room1.players,
      hash,
    });
  });
};

const onMsg = (sock) => {
  const socket = sock;

  socket.on('updatePlayer', (data) => {
    const room = rooms.room1;

    if (room && room.players[socket.hash]) {
      room.players[socket.hash].update(data);
    }
  });
};

const onDisconnect = (sock, io) => {
  const socket = sock;

  if (rooms.room1) {
    delete rooms.room1.players[socket.hash];

    io.sockets.in('room1').emit('disconnect', socket.hash);

    socket.leave('room1');
  }
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
