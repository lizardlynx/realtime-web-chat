'use strict';

//all listeners and funcs, which are often used by them are in this class

// eslint-disable-next-line no-unused-vars
class Listeners {
  constructor(socket) {
    if (!Listeners._instance) {
      Listeners._instance = this;
      this.socket = socket;
      this.userID = this.GenerateID();
      this.destinationUser = 'All';
      this.contactList = {};
      const listeners = this;
      this.messageTypes = {
        1: m => listeners.onChangeInfo(m),
        3: m => listeners.onTextMessage(m),
        4: m => listeners.onSearchMessage(m)
      };
      this.openedChat = document.getElementsByClassName('chat')[0];
      this.chosenContactColor = '#e6e8f2';
      this.contactColor = '#b3b9d5';
    }
    return Listeners._instance;
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
      const messages = document.getElementsByClassName(this.userID);
      for (let i = 0; i < messages.length; i++) {
        messages[i].childNodes[0].src = src;
      }
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
    const contacts = document.getElementsByClassName('contact');
    for (let i = 0; i < contacts.length; i++) {
      contacts[i].style.backgroundColor = this.contactColor;
    }
    contacts[0].style.backgroundColor = this.chosenContactColor;
    document.getElementById('destination').innerHTML = 'All';
    this.openedChat = dialogs[0];
    this.destinationUser = 'All';
  }

  //adds contacts and chats, sends text messages
  onTextMessage(message) {
    const contactsSection = document.getElementById('contacts');
    let chat = null;
    const u1Id = message.idfrom;
    const uID = this.userID.toString();
    if (u1Id === uID) {
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
        contact.addEventListener('mouseover', () => {
          contact.style.backgroundColor = this.chosenContactColor;
        });

        contact.addEventListener('mouseout', () => {
          this.mouseOut(contact, u1Id);
        });

        this.addEventListClick(contact, u1Id, message.name);
      }
    }
    this.sendMessage(chat, message, message.idfrom);
  }

  //adds contact based on search results and creates chat for contact
  onSearchMessage(message) {
    if (!message.expected) {
      const num = document.getElementById('num');
      num.innerHTML = message.list;
      return;
    }
    const contactsSection = document.getElementById('contacts');
    for (const user of message.list) {
      if (user[0] === this.userID || user[1] === 'unknown') continue;
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

      contact.addEventListener('mouseover', () => {
        contact.style.backgroundColor = this.chosenContactColor;
      });

      contact.addEventListener('mouseout', () => {
        this.mouseOut(contact, user[0]);
      });

      this.addEventListClick(contact, user[0], user[1]);
    }
  }

  //changes current chat
  addEventListClick(contact, id, name) {
    contact.removeEventListener('click', onclick);
    const listeners = this;
    function onclick() {
      listeners.openedChat = listeners.contactClick(contact, id, name);
    }
    contact.addEventListener('click', onclick);
  }

  //changes color of contact when mouse moves out
  mouseOut(contact, id) {
    const chatForContact = this.dialogExists(contact, id);
    if (this.openedChat !==  chatForContact || chatForContact === null) {
      contact.style.backgroundColor = this.contactColor;
    }
  }

  //handles change info of another user
  onChangeInfo(mess) {
    const message = mess.message;
    const id = message.id;
    const type = message.type;
    const info = message.info;
    const contact = this.contactList[id];
    if (type === 2) {
      if (contact) contact.childNodes[0].src = info;
      const messages = document.getElementsByClassName(id);
      for (let i = 0; i < messages.length; i++) {
        messages[i].childNodes[0].src = info;
      }
    } else if (type === 1) {
      if (this.userID === id) return;
      if (contact) {
        contact.childNodes[1].innerHTML = info;
        this.addEventListClick(contact, id, info);
        if (this.openedChat === this.selectContact(contact, id)) {
          document.getElementById('destination').innerHTML = info;
        }
      }
      const messages = document.getElementsByClassName(id);
      for (let i = 0; i < messages.length; i++) {
        messages[i].childNodes[2].childNodes[0].innerHTML = info;
      }
    }
  }

  //handles messages from server
  onSocketMessage(event) {
    const messageFromServer = event.data;
    const message = JSON.parse(messageFromServer);
    this.messageTypes[message.type](message);
  }

  //function for sending messages to chat
  sendMessage(chat, message, id) {
    const divMessage = document.createElement('div');
    divMessage.classList.add(id);

    if (message.message !== 'left') {
      const avatarPicture = new Image();
      avatarPicture.classList.add('avatar');
      avatarPicture.classList.add('avaText');
      avatarPicture.setAttribute('src', message.avatar);
      divMessage.appendChild(avatarPicture);

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
    const name = document.createElement('p');
    name.classList.add('name');
    name.innerText = message.name;
    p.appendChild(name);
    p.innerHTML += text;
    divMessage.appendChild(p);
    chat.appendChild(divMessage);
    this.scrollToBottom(chat);
  }

  //change color of online circle
  changeColor() {
    const colors = ['green', 'greenyellow'];
    const onlineCircle = document.getElementById('online');
    const color = onlineCircle.style.backgroundColor;
    if (color === colors[0]) {
      onlineCircle.style.backgroundColor = colors[1];
    } else onlineCircle.style.backgroundColor = colors[0];
  }

  //funcs, which are often used by listeners

  //opens dialog with contact and returns it
  contactClick(contact, idfrom, name) {
    this.destinationUser = idfrom;
    document.getElementById('destination').innerHTML = name;
    if (Object.keys(this.contactList).includes(idfrom)) {
      contact = this.contactList[idfrom];
    }
    const contacts = document.getElementsByClassName('contact');
    for (let i = 0; i < contacts.length; i++) {
      contacts[i].style.backgroundColor = this.contactColor;
    }
    contact.style.backgroundColor = this.chosenContactColor;
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

  //returns dialog or false if none
  dialogExists(contact, id) {
    const contactNumber = this.getContactNumberByValue(contact);
    if (contactNumber === null) return null;
    const chat = document.getElementsByClassName('chat')[contactNumber];
    if (this.contactList[id] === contact) return chat;
    else return null;
  }

  //get contactNumberBy its value
  getContactNumberByValue(contact) {
    const contacts = document.getElementsByClassName('contact');
    let contactNumber = null;
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i] === contact) {
        contactNumber = i;
        break;
      }
    }
    return contactNumber;
  }

  //returns dialog for communicating with chosen contact
  // adds contact to contacts
  selectContact(contact, idto) {
    document.getElementById('search-results').textContent = '';

    const contactNumber = this.getContactNumberByValue(contact);
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
