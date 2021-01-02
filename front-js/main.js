'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const socket = new WebSocket('ws://localhost:8000/');
  // eslint-disable-next-line no-undef
  const listeners = new Listeners(socket);

  const nickname = document.getElementById('nickname');
  const messageInput = document.getElementById('message-input');
  const submitButton = document.getElementById('submit-message-input');
  const avatar = document.getElementById('avatar');
  const changeAva = document.getElementById('change-avatar');
  const searchSection = document.getElementById('find');
  const allChat = document.getElementsByClassName('contact')[0];

  //saving all-chat to contacts
  listeners.addToContactList('All', allChat);

  //handling contact for all-chat
  allChat.addEventListener('click', () => {
    listeners.showAllChat();
  });

  //handling nickname input
  nickname.addEventListener('focusout', e => listeners.sendNameToServer(e));
  nickname.addEventListener('focusin', e => {
    e.preventDefault();
    nickname.style.borderColor = '#f5f500';
  });
  nickname.addEventListener('keydown', e => {
    if (e.code !== 'Enter') return;
    listeners.sendNameToServer(e);
  });

  //change avatar
  avatar.addEventListener('click', e => changeAva.click(e));
  changeAva.addEventListener('change', e => listeners.changeAvatar(e), false);

  //send message
  submitButton.addEventListener('click', e => listeners.submitButtonPressed(e));
  messageInput.addEventListener('keydown', e => {
    if (e.code === 'Enter' && e.shiftKey) {
      e.preventDefault();
      submitButton.click();
    }
  });

  //handling search section
  searchSection.addEventListener('keydown', e => listeners.submitSearch(e));

  //get message from server
  socket.onmessage = e => listeners.onSocketMessage(e);
});
