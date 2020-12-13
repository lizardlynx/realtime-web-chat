'use strict';

let destinationUser = "All";
const contactList = {};

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
  const searchResults = document.getElementById('search-results');
  const contactsSection = document.getElementById('contacts');
  let openedChat = document.getElementsByClassName('chat')[0];

  //handling return button to all chat
  const allChat = document.getElementsByClassName('contact')[0];
  contactList["All"] = allChat;
  allChat.addEventListener('click', () => {
    const dialogs = document.getElementsByClassName('chat');
    for (let dialog of dialogs) {
      dialog.style.display = "none";
    }
    dialogs[0].style.display = "block";
    document.getElementById('destination').innerHTML = "All";
    openedChat = dialogs[0];
    destinationUser = "All";
  });

  //handling enter on nickname input section --type 1--
  nickname.addEventListener('keydown', function(e){
    if (e.code === 'Enter') {
      e.preventDefault();
      const messageToServer = {
        type: 1,
        id: userID,
        name: nickname.value,
      }
      if (!messageToServer.name) messageToServer.name = 'unknown';
      socket.send(JSON.stringify(messageToServer));
      nickname.style.borderColor = "green";
    }
  });

  nickname.addEventListener('focusout', function(e){
    e.preventDefault();
      const messageToServer = {
        type: 1,
        id: userID,
        name: nickname.value,
      }
      if (!messageToServer.name) messageToServer.name = 'unknown';
      socket.send(JSON.stringify(messageToServer));
      nickname.style.borderColor = "green";
  });

  //change avatar --type 2--
  avatar.addEventListener('click', () => {
    changeAvatar.click();
  });
  
  changeAvatar.addEventListener('change', event => {
    if (event.target.files.length > 0) {
      const src = URL.createObjectURL(event.target.files[0]);
      avatar.src = src;
      const messageToServer = {
        type: 2,
        id: userID,
        avatar: '',
      }
  
      toDataURL(src)
      .then(dataUrl => {
        messageToServer.avatar = dataUrl;
        socket.send(JSON.stringify(messageToServer));
      });
    }
  }, false);

  //send message --type 3--
  //handling enter on message input section
  messageInput.addEventListener('keydown', function(e){
    if (e.code === 'Enter' && e.shiftKey) {
      e.preventDefault();
      submitButton.click();
    }
  });

  submitButton.addEventListener('click', event => {
    event.preventDefault();

    const messageToServer = {
      type: 3,
      id: userID,
      message: messageInput.value,
      destination: destinationUser,
    }
    socket.send(JSON.stringify(messageToServer));
    messageInput.value = "";
  });

  //handling enter on search section --type 4--
  searchSection.addEventListener('keydown', function(e){
    if (e.code === 'Enter') {
      e.preventDefault();
      if (searchSection.value == 'unknown') return;
      const messageToServer = {
        type: 4,
        id: userID,
        userToFind: searchSection.value,
      }
      socket.send(JSON.stringify(messageToServer));
    }
  });

  //get message from server
  socket.onmessage = event => {
    const messageFromServer = event.data;
    const message = JSON.parse(messageFromServer);
    console.log(message.type);
    if (message.type == 4)
    {
      for (const user of message.list) {
        if (user[0] == userID) continue;
        contactsSection.style.display = "none";

        const contact = document.createElement('div');
        const avatarPicture = new Image();
        avatarPicture.classList.add('avatar');
        avatarPicture.setAttribute('src', user[2]);
        contact.appendChild(avatarPicture);

        contact.classList.add('contact');
        const p = document.createElement('p');
        p.innerHTML = user[1];
        contact.appendChild(p);
        searchResults.appendChild(contact);

        contact.addEventListener('click', () => {
          const dialogs = document.getElementsByClassName('chat');
          for (let dialog of dialogs) {
            dialog.style.display = "none";
          }
          openedChat = openContact(contact, user[0], user[1]);
          openedChat.style.display = "block";
        });
      }
    } else if (message.type == 3) {
      let chat = openedChat;
      if (message.idfrom == userID) message.name = "You";
      else if (message.idto != "All") {
        const found = false;
        for (const id in contactList) {
          if (message.idfrom == id) {
            chat = openContact(contactList[id], message.idfrom, message.name);
            found = true;
            break;
          }
        }
        if (!found) {
          const contact = document.createElement('div');
          const avatarPicture = new Image();
          avatarPicture.classList.add('avatar');
          avatarPicture.setAttribute('src', message.avatar);
          contact.appendChild(avatarPicture);
  
          contact.classList.add('contact');
          const p = document.createElement('p');
          p.innerHTML = message.name;
          contact.appendChild(p);
          chat = openContact(contact, message.idfrom, message.name);
          contactsSection.appendChild(contact);
  
          contact.addEventListener('click', () => {
            const dialogs = document.getElementsByClassName('chat');
            for (let dialog of dialogs) {
              dialog.style.display = "none";
            }
            chat.style.display = "block";
          });
        }
      }
      sendMessage(chat, message);
    }
  };
});

//function for scrolling div to end
function scrollToBottom(element) {
  element.scrollTop = element.scrollHeight - element.getBoundingClientRect().height;
}

//function for sending messages to chat
function sendMessage(chat, message) {
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
  //handling new line
  message.message = message.message.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
  p.innerHTML = message.name + ': ' + message.message;
  divMessage.appendChild(p);
  chat.appendChild(divMessage);
  scrollToBottom(chat); 
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

//returns chat for communicating with chosen contact
//adds contact to contacts
function openContact(contact, idto, name) {
  document.getElementById('search-results').textContent = '';
  const dest = document.getElementById('destination');
  dest.innerHTML = name; 
  destinationUser = idto;

  const contacts = document.getElementsByClassName('contact');
  let contactNumber = null;
  for (let i = 0; i < contacts.length; i++) {
    if (contacts[i] == contact) {
      contactNumber = i;
      break;
    }
  }
  let dialog = null;
  if (contactNumber === null) {
    contact.classList.add('contact');
    dialog = document.createElement('div');
    dialog.classList.add('chat');
    const chatHolder = document.getElementById('chat-holder');
    chatHolder.appendChild(dialog);
    contactList[idto] = contact;
  } else {
    dialog = document.getElementsByClassName('chat')[contactNumber];
  } 
  document.getElementById('contacts').appendChild(contact);
  document.getElementById('contacts').style.display = "block";
  return dialog;
}
