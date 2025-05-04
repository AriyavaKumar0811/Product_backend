const {  ALLOWED_ORIGINS } = require('../config');
let socket;

module.exports.listen = (app) => {
  let io = require('socket.io')(app, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST']
    },
    allowEIO3: true,
    secure: true
  });

  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('socketOn', (message) => {
      socket.join(message)
    })
   

  });

  socket = io
  return io;

}

module.exports.emitMessage = (method, message) => {
  socket.sockets.emit(method, message)
};
