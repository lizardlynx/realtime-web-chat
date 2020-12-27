'use strict';

const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const messageToClient = require('./node-js/messageToClient');
const TextToClient = messageToClient.TextToClient;
const SearchToClient = messageToClient.SearchToClient;
//const mysql = require('mysql');

//this function asyncronously reads file
function readFileInfo(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) console.log('err in readFileInfo: ' + err);
      try {
        resolve(data);
      } catch (err) {
        reject(err.message);
      }
    });
  });
}

//handling rejections in readFileInfo
async function readFile(file) {
  try {
    const data = await readFileInfo(file);
    return data;
  } catch (err) {
    console.log('this error occured in readFile => ' + err);
    return false;
  }
}

//types of request extensions
const mime = {
  'html': 'text/html',
  'js': 'application/javascript',
  'css': 'text/css',
  'png': 'image/png',
  'ico': 'image/x-icon',
  'jpeg': 'image/jpeg',
};

//handle request in http server
async function handleRequest(req, res) {
  const url = req.url;
  let name = url;
  let extention = url.split('.')[1];
  if (url === '/') {
    extention = 'html';
    name = '/main.html';
  }
  let data = null;
  const typeAns = mime[extention];
  data = await readFile('.' + name);
  if (data) {
    res.writeHead(200, { 'Content-Type': `${typeAns}; charset=utf-8` });
    res.write(data);
  }
  res.end();
}

// Create an HTTP server
const server = http.createServer();

server.on('request', handleRequest);

server.listen(8000, () => {
  console.log('Server running on port 8000...');
});

//create websocket
const ws = new WebSocket.Server({ server });
const clients = {};
const dialogs = [];

//checks if dialog between two users already exists
function dialogExists(user1, user2) {
  if (dialogs.includes([user1, user2]) || dialogs.includes([user2, user1])) {
    return true;
  }
  return false;
}

ws.on('connection', connection => {

  //message from client
  connection.on('message', message => {
    const messageParsed = JSON.parse(message);
    const type = messageParsed.type;
    const id = messageParsed.id;
    const info = messageParsed.info;

    const defName = 'unknown';
    const defAvatar = './images/anonymous.jpeg';
    if (!clients[id]) clients[id] = [connection, defName, defAvatar];

    if (info) clients[id][type] = info;
    else if (type === 4) {
      const list = [];
      for (const [id, client] of Object.entries(clients)) {
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
      const uName = clients[id][1];
      const uAva = clients[id][2];
      const uMess = messageParsed.message;
      if (!dialogExists(u1Id, u2Id)) dialogs.push([u1Id, u2Id]);
      const messageToClient = new TextToClient(uName, u1Id, u2Id, uAva, uMess);
      let u2Connection = 'All';
      if (u2Id !== 'All') u2Connection = clients[u2Id][0];
      messageToClient.send(ws, u2Connection, connection);
    }
  });

  connection.on('close', () => {
    for (const [id, client] of Object.entries(clients)) {
      if (client[0] !== connection) continue;
      let i = 0;
      while (i < dialogs.length) {
        if (dialogs[i].lastIndexOf(id) === -1) {
          i++;
          continue;
        }
        const uName = clients[id][1];
        const uAva = clients[id][2];
        const u2Id = 'All';
        const uMess = 'left';
        const messageToClient = new TextToClient(uName, id, u2Id, uAva, uMess);
        for (let j = 0; j < 2; j++) {
          const u2Id = dialogs[i][j];
          messageToClient.idto = u2Id;
          let client = 'All';
          if (u2Id !== 'All') client = clients[u2Id][0];
          if (dialogs[i][j] === id) continue;
          else messageToClient.send(ws, client, connection);
        }
        dialogs.splice(i, 1);
        i = 0;
      }
      console.log(client[1] + ' left');
      delete clients[id];
    }
  });
});

