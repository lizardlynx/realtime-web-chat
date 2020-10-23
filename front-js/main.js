'use strict';

//function for sending messages to chat
function sendMessage(text) {
  const divMessage = document.createElement('div');
  text.message = text.message.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
  divMessage.innerHTML = `<p>${text.name + ': ' + text.message}</p>`;
  chat.appendChild(divMessage);
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

document.addEventListener('DOMContentLoaded', () => {

  const socket = new WebSocket('ws://localhost:8000/'); 

  //elements of html
  const nickname = document.getElementById('nickname');
  const message = document.getElementById('message');
  const submitButton = document.getElementById('submit-message');
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

  //typein message focus
  message.addEventListener('focus', () => {
    message.style.width = '50%';
  });

  //handling enter
  message.addEventListener('keydown', function(e){
    if (e.code === 'Enter' && e.shiftKey) {
      e.preventDefault();
      submitButton.click();
    }
  });

  //send message
  submitButton.addEventListener('click', event => {
    event.preventDefault();

    const text = {
      type: 'sendMessage',
      //name: nickname.value,
      message: message.value,
    }

    message.value = '';
    if (!text.name) text.name = 'unknown';
      socket.send(JSON.stringify(text));
      text.name = 'You';
      sendMessage(text);

      //typein message blur
      message.style.width = '20%';
    });

    //get message from server
    socket.onmessage = event => {
      const message = event.data;
      const text = JSON.parse(message);
      const type = text.type;
      if (type == "sendMessage") {
        sendMessage(text);
      } else if (type == "createGroup") {
        createGroup(text);
      } 
    };

});