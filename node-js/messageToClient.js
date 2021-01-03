'use strict';

const WebSocket = require('ws');

//message to client hierarchy
class MessageToClient {
  constructor() {
    this.idto = 'All';
    if (this.constructor === MessageToClient) {
      throw new Error('Cannot instantiate this class');
    }
  }

  //find who to send
  send(ws, client, connection) {
    if (this.idto === 'All') this.sendToEverybody(ws);
    else this.sendToID(client, connection);
  }

  //send to all connected clients
  sendToEverybody(ws) {
    ws.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(this));
      }
    });
  }

  //send to specific client
  sendToID(client, connection) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(this));
      if (connection) connection.send(JSON.stringify(this));
    }
  }
}

class InfoToClient extends MessageToClient {
  constructor(message) {
    super();
    this.type = 1;
    this.message = message;
  }
}

class TextToClient extends MessageToClient {
  constructor(name, idfrom, idto, avatar, message) {
    super();
    this.type = 3;
    this.name = name;
    this.idfrom = idfrom;
    this.idto = idto;
    this.avatar = avatar;
    this.message = message;
  }
}

class SearchToClient extends MessageToClient {
  constructor(list, expected) {
    super();
    this.type = 4;
    this.idto = 'client';
    this.list = list;
    this.expected = expected;
  }
}

module.exports = { InfoToClient,
  TextToClient,
  SearchToClient };
