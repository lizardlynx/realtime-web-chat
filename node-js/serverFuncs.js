'use strict';

const FileManager = require('./fileManager').FileManager;
const messageToClient = require('./messageToClient');
const TextToClient = messageToClient.TextToClient;
const SearchToClient = messageToClient.SearchToClient;
const InfoToClient = messageToClient.InfoToClient;

class ServerFuncs {
  constructor() {
    if (!ServerFuncs._instance) {
      ServerFuncs._instance = this;
      //saved dialogs and clients
      this.clients = {};
      this.dialogs = [];
    }
    return ServerFuncs._instance;
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

  //on connections changed
  onConnection(ws, connection = null) {
    let num = 0;
    ws.clients.forEach(() => num++);
    const mess = new SearchToClient(num - 1, false);
    mess.idto = 'All';
    mess.send(ws, null, connection);
  }

  //handles new message to server
  connectionMessage(ws, connection, message) {
    const messageParsed = JSON.parse(message);
    const type = messageParsed.type;
    const id = messageParsed.id;
    const info = messageParsed.info;

    const defName = 'unknown';
    const defAvatar = './images/anonymous.jpeg';
    if (!this.clients[id]) {
      this.clients[id] = [connection, defName, defAvatar];
      this.dialogs.push([id.toString(), 'All']);
    }

    if (info) {
      this.clients[id][type] = info;
      for (let i = 0; i < this.dialogs.length; i++) {
        if (this.dialogs[i].includes(id.toString())) {
          const client = this.getU2Id(id, this.dialogs[i]);
          const infotc = new InfoToClient(messageParsed);
          infotc.send(ws, client.connection, connection);
        }
      }
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
    } else if (type === 4) {
      const list = [];
      for (const [id, client] of Object.entries(this.clients)) {
        const clientName = client[1];
        const clientID = client[2];
        const userToFind = messageParsed.userToFind;
        if (clientName === userToFind) list.push([id, clientName, clientID]);
      }
      const messageToClient = new SearchToClient(list, true);
      messageToClient.send(ws, connection, null);
    }
  }

  //handles client leaving
  connectionClose(ws, connection) {
    this.onConnection(ws, connection);
    for (const [id, client] of Object.entries(this.clients)) {
      const u1Id = id.toString();
      if (client[0] !== connection) continue;
      let i = 0;
      while (i < this.dialogs.length) {
        if (this.dialogs[i].lastIndexOf(u1Id) === -1) {
          i++;
          continue;
        }
        const uName = this.clients[u1Id][1];
        const uAva = this.clients[u1Id][2];
        const u2Id = 'All';
        const uMess = 'left';
        const messToClient = new TextToClient(uName, u1Id, u2Id, uAva, uMess);
        const client = this.getU2Id(u1Id, this.dialogs[i]);
        messToClient.idto = client.id;
        messToClient.send(ws, client.connection, connection);
        this.dialogs.splice(i, 1);
        i = 0;
      }
      console.log(client[1] + ' left');
      delete this.clients[u1Id];
    }
  }

  //helps get second user in dialog, returns id and client connection
  getU2Id(u1Id, dialog) {
    for (let j = 0; j < 2; j++) {
      const u2Id = dialog[j];
      let client = 'All';
      if (u2Id !== 'All') client = this.clients[u2Id][0];
      if (u1Id === u2Id) continue;
      else return { id: u2Id, connection: client };
    }
  }

  //sends info to clients every 50 secs //needed for heroku
  updateConnection() {
    const listeners = this;
    console.log('update');
    setInterval(() => {
      listeners.onConnection();
      console.log('update');
    }, 5000);
  }

}

module.exports = { ServerFuncs };
