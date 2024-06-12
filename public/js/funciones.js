document.addEventListener('DOMContentLoaded', function() {
  const socket = io();
  const username = localStorage.getItem('username');

  if (!username) {
    if (window.location.pathname.endsWith('chat.html')) {
      window.location.href = 'login.html';
    }
  } else {
    socket.emit('user connected', username);
    console.log(`${username} connected`);

    // General chat
    document.getElementById('sendGeneralButton').addEventListener('click', function() {
      const message = document.getElementById('message').value;
      if (message.trim() !== '') {
        socket.emit('chat message', { username, message });
        document.getElementById('message').value = '';
      }
    });

    socket.on('chat message', function(data) {
      const messageList = document.getElementById('general-message-list');
      const messageItem = document.createElement('div');
      messageItem.className = 'message-item';
      messageItem.textContent = `${data.username === username ? 'Tú' : data.username}: ${data.message}`;
      messageItem.style.color = data.color;
      messageList.appendChild(messageItem);
      messageList.scrollTop = messageList.scrollHeight;
    });

    // Private chat
    document.getElementById('sendPrivateButton').addEventListener('click', function() {
      const privateChatWith = localStorage.getItem('privateChatWith');
      const message = document.getElementById('private-message').value;
      if (privateChatWith && message.trim() !== '') {
        socket.emit('private message', { from: username, to: privateChatWith, message });
        document.getElementById('private-message').value = '';
      }
    });

    socket.on('private message', function(data) {
      const messageList = document.getElementById('private-message-list');
      const messageItem = document.createElement('div');
      messageItem.className = 'message-item private';
      messageItem.textContent = `${data.from === username ? 'Tú' : data.from}: ${data.message}`;
      messageItem.style.color = data.color;
      messageList.appendChild(messageItem);
      messageList.scrollTop = messageList.scrollHeight;
    });

    socket.on('user connected', function(users) {
      const userList = document.getElementById('user-list');
      userList.innerHTML = '';

      // Add current user at the top
      const currentUserItem = document.createElement('li');
      currentUserItem.className = 'user-item current-user';
      const currentUserStatusClass = getStatusClass(users.find(user => user.name === username).status);
      currentUserItem.innerHTML = `${username}<span class="user-status ${currentUserStatusClass}"></span>`;
      userList.appendChild(currentUserItem);

      // Add other users
      users.forEach(user => {
        if (user.name !== username) {
          const userItem = document.createElement('li');
          userItem.className = 'user-item';
          userItem.innerHTML = `${user.name}<span class="user-status ${getStatusClass(user.status)}"></span>`;
          userItem.style.color = user.color;
          userItem.addEventListener('click', () => {
            localStorage.setItem('privateChatWith', user.name);
            document.getElementById('privateChatWith').textContent = user.name;
            document.getElementById('general-chat').style.display = 'none';
            document.getElementById('private-chat').style.display = 'flex';
            document.getElementById('switchToGeneralChat').classList.remove('hidden');
          });
          userList.appendChild(userItem);
        }
      });
    });

    document.getElementById('status').addEventListener('change', function() {
      const status = this.value;
      socket.emit('status change', { username, status });

      // Actualizar el estado del usuario actual en la interfaz
      const currentUserStatus = document.querySelector('.current-user .user-status');
      if (currentUserStatus) {
        currentUserStatus.className = `user-status ${getStatusClass(status)}`;
      }
    });

    socket.on('private message notification', function(data) {
      alert(`Nuevo mensaje privado de ${data.from}`);
    });

    document.getElementById('switchToGeneralChat').addEventListener('click', function() {
      document.getElementById('general-chat').style.display = 'flex';
      document.getElementById('private-chat').style.display = 'none';
      this.classList.add('hidden');
    });

    // Hide the "Chat General" button initially
    document.getElementById('switchToGeneralChat').classList.add('hidden');
  }
});

function getStatusClass(status) {
  switch (status) {
    case 'available': return 'status-available';
    case 'away': return 'status-away';
    case 'busy': return 'status-busy';
    default: return '';
  }
}
