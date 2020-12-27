'use strict';

//all listeners and funcs, which are often used by them are in this class

// eslint-disable-next-line no-unused-vars
class Listeners {
  constructor(socket) {
    this.socket = socket;
    this.userID = this.GenerateID();
    this.destinationUser = 'All';
    this.contactList = {};
    this.openedChat = document.getElementsByClassName('chat')[0];
  }

  //sends nickname to server
  sendNameToServer(e) {
    e.preventDefault();
    const nickname = document.getElementById('nickname');
    if (!nickname.value) nickname.value = 'unknown';
    // eslint-disable-next-line no-undef
    const messageToServer = new NameToServer(nickname.value);
    messageToServer.send(this.socket, this.userID);
    nickname.style.borderColor = 'green';
  }

  //adds chats and names to contact list
  addToContactList(dest, chat) {
    this.contactList[dest] = chat;
  }

  //changes avatar on server
  async changeAvatar(e) {
    if (e.target.files.length > 0) {
      const src = URL.createObjectURL(e.target.files[0]);
      const avatar = document.getElementById('avatar');
      avatar.src = src;
      const dataUrl = await this.toDataURL(src);
      // eslint-disable-next-line no-undef
      const messageToServer = new AvatarToServer(dataUrl);
      messageToServer.send(this.socket, this.userID);
    }
  }

  //sends text message
  submitButtonPressed(e) {
    e.preventDefault();
    const messageInput = document.getElementById('message-input');
    const text = messageInput.value;
    // eslint-disable-next-line no-undef
    const messageToServer = new TextToServer(text, this.destinationUser);
    messageToServer.send(this.socket, this.userID);
    messageInput.value = '';
  }

  //send search info to server
  submitSearch(e) {
    if (e.code === 'Enter') {
      e.preventDefault();
      const searchSection = document.getElementById('find');
      // eslint-disable-next-line no-undef
      const messageToServer = new SearchToServer(searchSection.value);
      messageToServer.send(this.socket, this.userID);
    }
  }

  //shows all-chat
  showAllChat() {
    const dialogs = document.getElementsByClassName('chat');
    for (const dialog of dialogs) {
      dialog.style.display = 'none';
    }
    dialogs[0].style.display = 'block';
    document.getElementById('destination').innerHTML = 'All';
    this.openedChat = dialogs[0];
    this.destinationUser = 'All';
  }

  //adds contacts and chats, sends text messages
  onTextMessage(message) {
    const contactsSection = document.getElementById('contacts');
    let chat = null;
    const u1Id = message.idfrom;
    if (u1Id === this.userID.toString()) {
      message.name = 'You';
      chat = this.openedChat;
    } else if (message.idto === 'All') {
      chat = document.getElementsByClassName('chat')[0];
    } else {
      for (const id in this.contactList) {
        if (u1Id === id) {
          chat = this.selectContact(this.contactList[id], u1Id);
          break;
        }
      }
      if (chat === null) {
        console.log('create');
        const contact = document.createElement('div');
        contact.classList.add('contact');
        const avatarPicture = new Image();
        avatarPicture.classList.add('avatar');
        avatarPicture.setAttribute('src', message.avatar);
        contact.appendChild(avatarPicture);

        const p = document.createElement('p');
        p.innerHTML = message.name;
        contact.appendChild(p);
        chat = this.selectContact(contact, u1Id);
        contactsSection.appendChild(contact);

        contact.addEventListener('click', () => {
          this.openedChat = this.contactClick(contact, u1Id, message.name);
        });
      }
    }
    this.sendMessage(chat, message);
  }

  //adds contact based on search results and creates chat for contact
  onSearchMessage(message) {
    const contactsSection = document.getElementById('contacts');
    for (const user of message.list) {
      if (user[0] === this.userID) continue;
      contactsSection.style.display = 'none';

      const contact = document.createElement('div');
      const avatarPicture = new Image();
      avatarPicture.classList.add('avatar');
      avatarPicture.setAttribute('src', user[2]);
      contact.appendChild(avatarPicture);

      contact.classList.add('contact');
      const p = document.createElement('p');
      p.innerHTML = user[1];
      contact.appendChild(p);
      const searchResults = document.getElementById('search-results');
      searchResults.appendChild(contact);

      contact.addEventListener('click', () => {
        this.openedChat = this.contactClick(contact, user[0], user[1]);
      });
    }
  }

  //handles messages from server
  onSocketMessage(event) {
    const messageFromServer = event.data;
    const message = JSON.parse(messageFromServer);
    if (message.type === 3) this.onTextMessage(message);
    else if (message.type === 4) this.onSearchMessage(message);
  }

  //function for sending messages to chat
  sendMessage(chat, message) {
    const divMessage = document.createElement('div');

    if (message.message !== 'left') {
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
    }

    const p = document.createElement('p');
    p.classList.add('message');
    //handling new line
    let text = message.message;
    text = text.replace(/\r\n/g, '<br />').replace(/[\r\n]/g, '<br />');
    p.innerHTML = message.name + ': ' + text;
    divMessage.appendChild(p);
    chat.appendChild(divMessage);
    this.scrollToBottom(chat);
  }

  //funcs, which are often used by listeners

  //opens dialog with contact and returns it
  contactClick(contact, idfrom, name) {
    this.destinationUser = idfrom;
    document.getElementById('destination').innerHTML = name;
    const dialogs = document.getElementsByClassName('chat');
    for (const dialog of dialogs) {
      dialog.style.display = 'none';
    }
    const chat = this.selectContact(contact, idfrom);
    chat.style.display = 'block';
    return chat;
  }

  //function for scrolling div to end
  scrollToBottom(e) {
    e.scrollTop = e.scrollHeight - e.getBoundingClientRect().height;
  }

  //img to data url
  async toDataURL(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  //generates id for user
  GenerateID() {
    return Math.floor(Math.random() * 10000);
  }

  //returns chat for communicating with chosen contact, adds contact to contacts
  selectContact(contact, idto) {
    document.getElementById('search-results').textContent = '';

    const contacts = document.getElementsByClassName('contact');
    let contactNumber = null;
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i] === contact) {
        contactNumber = i;
        break;
      }
    }
    let dialog = null;
    if (contactNumber === null) {
      const chatHolder = document.getElementById('chat-holder');
      dialog = document.createElement('div');
      chatHolder.appendChild(dialog);
      dialog.style.display = 'none';
      dialog.classList.add('chat');
      contact.classList.add('contact');
      this.addToContactList(idto, contact);
      document.getElementById('contacts').appendChild(contact);
    } else {
      dialog = document.getElementsByClassName('chat')[contactNumber];
    }
    document.getElementById('contacts').style.display = 'block';
    return dialog;
  }
}
