'use strict';

//function for sending messages to chat
function sendMessage(message) {
  const divMessage = document.createElement('div');
  message.message = message.message.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
  divMessage.innerHTML = `<p>${message.name + ': ' + message.message}</p>`;
  chat.appendChild(divMessage);

  const avatarPicture = new Image();
  console.log(message.avatar instanceof Blob);
  let objectURL = message.avatar;//URL.createObjectURL(message.avatar); //'../images/anonymous.jpeg';
  avatarPicture.classList.add('avatar');
  avatarPicture.src = objectURL;
  divMessage.appendChild(avatarPicture);
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
function getBase64Image(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const dataURL = canvas.toDataURL("image/jpeg");
  return dataURL;//.replace(/^data:image\/(png|jpg);base64,/, "");
}

document.addEventListener('DOMContentLoaded', () => {

  const socket = new WebSocket('ws://localhost:8000/'); 

  //elements of html
  const nickname = document.getElementById('nickname');
  const messageInput = document.getElementById('message-input');
  const submitButton = document.getElementById('submit-message-input');
  const avatar = document.getElementById('avatar');
  const changeAvatar = document.getElementById('change-avatar');
  const group = document.getElementById('group');
  const createButton = document.getElementById('create-group');
  const groups = document.getElementById('groups');
  const chat = document.getElementById('chat');

        /*//create group
        createButton.addEventListener('click', event => {
          event.preventDefault();
          
          const message = {
            type: 'createGroup',
            name: nickname.value,
            name: group.value,
          }

          socket.send(JSON.stringify(message));
          createGroup(message);
        });*/

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
    }

    const dataUrl = getBase64Image(avatar);

    text.avatar = dataUrl;
    messageInput.value = '';
    if (!text.name) text.name = 'unknown';
    socket.send(JSON.stringify(text));
    text.name = 'You';
    sendMessage(text);
    console.log(text);

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

  

});