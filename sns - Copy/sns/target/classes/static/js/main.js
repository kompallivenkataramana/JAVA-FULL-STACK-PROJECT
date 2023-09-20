'use strict';

var loginPage = document.querySelector('#login-page');
var chatPage = document.querySelector('#chat-page');
var loginForm = document.querySelector('#loginForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var registrationPage = document.querySelector('#registration-page');
var registrationForm = document.querySelector('#registrationForm');
var registerLink = document.querySelector('#newRegister');
var logoutButton = document.querySelector('#logoutButton');

var stompClient = null;
var username = null;
var password = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#username').value.trim();
    password = document.querySelector('#password').value.trim();

    if(username && password) {
        const loginData = { username, password };

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error('Login failed');
                alert('Login Failed');
                loginForm.reset();
            }
        })
        .then(data => {
            // Successfully logged in
            loginPage.classList.add('hidden');
            chatPage.classList.remove('hidden');

            var socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, onConnected, onError);
        })
        .catch(error => {
            console.error('Login failed:', error);
            // Handle login error, show error message to the user, etc.
            alert('Login Failed');
                loginForm.reset();
        });
    }
    event.preventDefault();
}

function register(event) {
    event.preventDefault();

    var fullname = document.querySelector('#fullname').value.trim();
    var email = document.querySelector('#email').value.trim();
    var newUsername = document.querySelector('#rusername').value.trim();
    var newPassword = document.querySelector('#rpassword').value.trim();
    console.log(fullname,email,newUsername,newPassword);

    if (fullname && email && newUsername && newPassword) {
        const registrationData = {
            fullname: fullname,
            email: email,
            newUsername: newUsername,
            newPassword: newPassword
        };

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        })
        .then(response => {
            if (response.ok) {
                // Registration successful
                alert('Registration successful! You can now log in.');
                registrationForm.reset(); // Clear the form fields
                registrationPage.classList.add('hidden');
                loginPage.classList.remove('hidden');
            } else {
                throw new Error('Registration failed1');
            }
        })
        .catch(error => {
            console.error('Registration failed2:', error);
            // Handle registration error, show error message to the user, etc.
        });
    }
}

function newRegister(event){
    loginPage.classList.add('hidden');
    registrationPage.classList.remove('hidden');
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}

function logout() {
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            // Successfully logged out
            window.location.reload(); // Refresh the page to go back to the login page
        } else {
            throw new Error('Logout failed');
        }
    })
    .catch(error => {
        console.error('Logout failed:', error);
        // Handle logout error, show error message to the user, etc.
    });
}

function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

loginForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
registrationForm.addEventListener('submit', register, true);
registerLink.addEventListener('click',newRegister);
logoutButton.addEventListener('click',logout);
