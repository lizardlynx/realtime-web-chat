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

ws.on('connection', (connection, req) => {
  //join
  const ip = req.socket.remoteAddress;

  //message from client
  connection.on('message', message => {
    const messageParsed = JSON.parse(message);
    const type = messageParsed.type;
    const id = messageParsed.id;
    const info = messageParsed.info;

    if (!clients[id]) clients[id] = [connection, 'unknown', './images/anonymous.jpeg'];

    if (info) clients[id][type] = info;
    else if (type == 4) {
      const list = [];
      for (const [id, client] of Object.entries(clients)) {
        if (client[1] == messageParsed.userToFind) list.push([id, client[1], client[2]]);
      }
      const messageToClient = new SearchToClient(list);
      messageToClient.send(ws, connection, null);
    } else if (type == 3) {
      if (!dialogs.includes([id.toString(), messageParsed.destination.toString()]) && !dialogs.includes([messageParsed.destination.toString(), id.toString()])) dialogs.push([id.toString(), messageParsed.destination.toString()]);
      const messageToClient = new TextToClient(clients[id][1], id, messageParsed.destination, clients[id][2], messageParsed.message);
      let client = 'All';
      if (messageParsed.destination != 'All') client = clients[messageParsed.destination][0];
      messageToClient.send(ws, client, connection);
    }
  });



  connection.on('close', () => {
    for (const [id, client] of Object.entries(clients)) {
      if (client[0] != connection) continue;
      let i = 0;
      while (i < dialogs.length) {
        if (dialogs[i].lastIndexOf(id) == -1) {
          i++;
          continue;
        }
        const messageToClient = new TextToClient(clients[id][1], id, 'All', clients[id][2], 'left');
        for (let j = 0; j < 2; j++) {
          messageToClient.idto = dialogs[i][j];
          let client = 'All';
          if (messageToClient.idto != 'All') client = clients[messageToClient.idto][0];
          if (dialogs[i][j] == id) continue;
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

