const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  socket.on('user connected', (username) => {
    const user = {
      id: socket.id,
      name: username,
      status: 'available',
      color: getRandomColor(),
    };
    users.push(user);
    io.emit('user connected', users);
  });

  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  socket.on('private message', (data) => {
    const targetUser = users.find(user => user.name === data.to);
    if (targetUser) {
      io.to(targetUser.id).emit('private message', data);
      io.to(targetUser.id).emit('private message notification', data);
    }
  });

  socket.on('status change', (data) => {
    const user = users.find(u => u.name === data.username);
    if (user) {
      user.status = data.status;
      io.emit('user connected', users);
    }
  });

  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.id === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
      io.emit('user connected', users);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
