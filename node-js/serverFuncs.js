'use strict';

const FileManager = require('./fileManager').FileManager;
const messageToClient = require('./messageToClient');
const TextToClient = messageToClient.TextToClient;
const SearchToClient = messageToClient.SearchToClient;

class ServerFuncs {
  constructor() {
    //saved dialogs and clients
    this.clients = {};
    this.dialogs = [];
  }

  //handle request in http server
  async handleRequest(req, res) {
    //types of request extensions
    const mime = {
      'html': 'text/html',
      'js': 'application/javascript',
      'css': 'text/css',
      'png': 'image/png',
      'ico': 'image/x-icon',
      'jpeg': 'image/jpeg',
    };
    // Create FileManager
    const fileManager = new FileManager();
    const url = req.url;
    let name = url;
    let extention = url.split('.')[1];
    if (url === '/') {
      extention = 'html';
      name = '/main.html';
    }
    let data = null;
    const typeAns = mime[extention];
    data = await fileManager.readFile('.' + name);
    if (data) {
      res.writeHead(200, { 'Content-Type': `${typeAns}; charset=utf-8` });
      res.write(data);
    }
    res.end();
  }

  //checks if dialog between two users already exists
  dialogExists(user1, user2) {
    const dialogs = this.dialogs;
    for (let i = 0; i < dialogs.length; i++) {
      if (dialogs[i].includes(user1) && dialogs[i].includes(user2)) return true;
    }
    return false;
  }

  //handles new message to server
  connectionMessage(ws, connection, message) {
    const messageParsed = JSON.parse(message);
    const type = messageParsed.type;
    const id = messageParsed.id;
    const info = messageParsed.info;

    const defName = 'unknown';
    const defAvatar = './images/anonymous.jpeg';
    if (!this.clients[id]) this.clients[id] = [connection, defName, defAvatar];

    if (info) this.clients[id][type] = info;
    else if (type === 4) {
      const list = [];
      for (const [id, client] of Object.entries(this.clients)) {
        const clientName = client[1];
        const clientID = client[2];
        const userToFind = messageParsed.userToFind;
        if (clientName === userToFind) list.push([id, clientName, clientID]);
      }
      const messageToClient = new SearchToClient(list);
      messageToClient.send(ws, connection, null);
    } else if (type === 3) {
      const u1Id = id.toString();
      const u2Id = messageParsed.destination.toString();
      const uName = this.clients[id][1];
      const uAva = this.clients[id][2];
      const uMess = messageParsed.message;
      if (!this.dialogExists(u1Id, u2Id)) {
        this.dialogs.push([u1Id, u2Id]);
      }
      const messageToClient = new TextToClient(uName, u1Id, u2Id, uAva, uMess);
      let u2Connection = 'All';
      if (u2Id !== 'All') u2Connection = this.clients[u2Id][0];
      messageToClient.send(ws, u2Connection, connection);
    }
  }

  //handles client leaving
  connectionClose(ws, connection) {
    for (const [id, client] of Object.entries(this.clients)) {
      if (client[0] !== connection) continue;
      let i = 0;
      while (i < this.dialogs.length) {
        if (this.dialogs[i].lastIndexOf(id) === -1) {
          i++;
          continue;
        }
        const uName = this.clients[id][1];
        const uAva = this.clients[id][2];
        const u2Id = 'All';
        const uMess = 'left';
        const messageToClient = new TextToClient(uName, id, u2Id, uAva, uMess);
        for (let j = 0; j < 2; j++) {
          const u2Id = this.dialogs[i][j];
          messageToClient.idto = u2Id;
          let client = 'All';
          if (u2Id !== 'All') client = this.clients[u2Id][0];
          if (this.dialogs[i][j] === id) continue;
          else messageToClient.send(ws, client, connection);
        }
        this.dialogs.splice(i, 1);
        i = 0;
      }
      console.log(client[1] + ' left');
      delete this.clients[id];
    }
  }

}

module.exports = { ServerFuncs };
