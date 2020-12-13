'use strict';

const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
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
async function handleRequest (req, res) {
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
const ws = new WebSocket.Server({server});
const clients = {};

ws.on('connection', (connection, req) => {
  //join
  const ip = req.socket.remoteAddress;

  //message from client
  connection.on('message', message => {
    const messageParsed = JSON.parse(message);
    const type = messageParsed.type;
    const id = messageParsed.id;
    const name = messageParsed.name;
    const avatar = messageParsed.avatar;

    if (!clients[id]) clients[id] = [connection, 'unknown', './images/anonymous.jpeg'];
    
    if (type == 1) {
      clients[id][1] = name;
    } else if (type == 2) {
      clients[id][2] = avatar;
    } else if (type == 4) {
      const messageToClient = {
        type: 4,
        list: [],
      };
      const userToFind = messageParsed.userToFind;
      for (let [id, client] of Object.entries(clients)) {
        if (client[1] == userToFind) messageToClient.list.push([id, client[1], client[2]]);
      }
      connection.send(JSON.stringify(messageToClient));
    } else if (type == 3) {
      const messageToClient = {
        type: 3,
        name: clients[id][1],
        idfrom: id,
        idto: messageParsed.destination,
        avatar: clients[id][2],
        message: messageParsed.message,
      }
      if (messageParsed.destination == "All") {
        //send message to everybody
        ws.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(messageToClient));
          }
        });
      } else {
        if (clients[messageParsed.destination][0].readyState === WebSocket.OPEN) {
          clients[messageParsed.destination][0].send(JSON.stringify(messageToClient));
          connection.send(JSON.stringify(messageToClient));
        }
      }
      
    } 
  });
  
  connection.on('close', () => {
  });
});

