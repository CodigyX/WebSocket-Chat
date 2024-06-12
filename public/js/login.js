// login.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
  
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
      const username = document.getElementById('username').value;
  
      if (email.trim() !== '' && username.trim() !== '') {
        // Store username in local storage
        localStorage.setItem('username', username);
        // Redirect to chat page
        window.location.href = 'chat.html';
      }
    });
  });
  