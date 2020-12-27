'use strict';

//message to server hierarchy
class MessageToServer {
  constructor() {
    if (this.constructor === MessageToServer) {
      throw new Error('Cannot instantiate this class');
    }
  }

  send(socket, id) {
    this.id = id;
    socket.send(JSON.stringify(this));
  }
}
// eslint-disable-next-line no-unused-vars
class NameToServer extends MessageToServer {
  constructor(name) {
    super();
    this.type = 1;
    this.info = name;
  }
}

// eslint-disable-next-line no-unused-vars
class AvatarToServer extends MessageToServer {
  constructor(avatar) {
    super();
    this.type = 2;
    this.info = avatar;
  }
}
// eslint-disable-next-line no-unused-vars
class TextToServer extends MessageToServer {
  constructor(message, destinationID) {
    super();
    this.type = 3;
    this.message = message;
    this.destination = destinationID;
  }
}

// eslint-disable-next-line no-unused-vars
class SearchToServer extends MessageToServer {
  constructor(userToFindID) {
    super();
    this.type = 4;
    this.userToFind = userToFindID;
  }
}
