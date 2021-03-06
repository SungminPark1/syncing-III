const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const sockets = require('./sockets.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted/`)));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../hosted/index.html`));
});

const server = http.createServer(app);

// pass in the http server into socketio and grab the websocket server as io
const io = socketio(server);

sockets.handleSockets(io);

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${PORT}`);
});
