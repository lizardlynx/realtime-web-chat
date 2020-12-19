'use strict';

//message to server hierarchy
class MessageToServer
{
  constructor () {
    if (this.constructor === MessageToServer) {
      throw new Error("Cannot instantiate this class");
    }
  }

  send(socket, id) {
    this.id = id;
    socket.send(JSON.stringify(this));
  }
}
class NameToServer extends MessageToServer {
  constructor(name) {
    super();
    this.type = 1;
    this.name = name;
  }
}

class AvatarToServer extends MessageToServer {
  constructor(avatar) {
    super();
    this.type = 2;
    this.avatar = avatar;
  }
}
class TextToServer extends MessageToServer {
  constructor(message, destinationID) {
    super();
    this.type = 3;
    this.message = message;
    this.destination = destinationID;
  }
}

class SearchToServer extends MessageToServer {
  constructor(userToFindID) {
    super();
    this.type = 4;
    this.userToFind = userToFindID;
  }
}