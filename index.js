'use strict';

const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const mysql = require('mysql');

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
  const ip = req.socket.remoteAddress;

  connection.on('message', message => {
    const messageParsed = JSON.parse(message);
    const type = messageParsed.type;
    const id = messageParsed.id;

    if (type == 'sendMessage') {
      const name = messageParsed.name;
      if(!Object.keys(clients).includes(id)) 
      {
        ws.id = id++;
        clients[ws.id] = [ws, name];
        console.log(clients);
      }
    
      ws.clients.forEach(function each(client) {
        if (client !== connection && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else if(type == "getUsers") {
      //TODO: find a way to display all users without any unnessesary information
      //clients[id][0].send(clients);
    }
    
  });
  
  connection.on('close', () => {
  });
});

