'use strict';

//function for scrolling div to end
function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight - element.getBoundingClientRect().height;
}

//function for sending messages to chat
function sendMessage(message) {
  const divMessage = document.createElement('div');
  
  const avatarPicture = new Image();
  avatarPicture.classList.add('avatar');
  avatarPicture.setAttribute('src', message.avatar);
  chat.appendChild(avatarPicture);

  const pTime = document.createElement('p');
  const time = new Date();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  pTime.classList.add('time');
  pTime.innerHTML = hours + ':' + minutes;
  divMessage.appendChild(pTime);

  const p = document.createElement('p');
  p.classList.add('message');
  message.message = message.message.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
  p.innerHTML = message.name + ': ' + message.message;
  divMessage.appendChild(p);
  chat.appendChild(divMessage);
  scrollToBottom(chat); 
}

//function for creating groups
function createGroup(group) {
  const buttonGroup = document.createElement('button');
  buttonGroup.innerHTML = `<p>${group.name}</p>`;
  groups.appendChild(buttonGroup);
  buttonGroup.addEventListener('click', event => {
    //open dialog
    console.log(group.name);
  });
}

//img to data url
const toDataURL = url => fetch(url)
.then(response => response.blob())
.then(blob => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(blob);
}));

function GenerateID() {
  return Math.floor(Math.random() * 10000);
}

document.addEventListener('DOMContentLoaded', () => {

  const socket = new WebSocket('ws://localhost:8000/'); 
  const userID = GenerateID();

  //elements of html
  const nickname = document.getElementById('nickname');
  const messageInput = document.getElementById('message-input');
  const submitButton = document.getElementById('submit-message-input');
  const avatar = document.getElementById('avatar');
  const changeAvatar = document.getElementById('change-avatar');
  const searchSection = document.getElementById('find');

  //handling enter
  messageInput.addEventListener('keydown', function(e){
    if (e.code === 'Enter' && e.shiftKey) {
      e.preventDefault();
      submitButton.click();
    }
  });

  avatar.addEventListener('click', () => {
    changeAvatar.click();
  });

  //change avatar
  changeAvatar.addEventListener('change', event => {
    if (event.target.files.length > 0) {
      const src = URL.createObjectURL(event.target.files[0]);
      avatar.src = src;
    }
  }, false);

  //send message
  submitButton.addEventListener('click', event => {
    event.preventDefault();

    const text = {
      type: 'sendMessage',
      name: nickname.value,
      message: messageInput.value,
      avatar: '',
      id: userID,
    }

    toDataURL(avatar.src)
    .then(dataUrl => {
      text.avatar = dataUrl;
      messageInput.value = '';
      if (!text.name) text.name = 'unknown';
      socket.send(JSON.stringify(text));
      text.name = 'You';
      sendMessage(text);
      console.log(text);
    });

  });

  //get message from server
  socket.onmessage = event => {
    const message = event.data;
    console.log(typeof event, typeof message, message);
    const text = JSON.parse(message);
    const type = text.type;
    if (type == "sendMessage") {
      sendMessage(text);
    } else if (type == "createGroup") {
      createGroup(text);
    } 
  };

  searchSection.addEventListener('click', () => {
    const getUsers = {
      id: userID,
      type: "getUsers",
    }
    socket.send(JSON.stringify(getUsers));

    //get list of available users and show them as dropdown
  });

});