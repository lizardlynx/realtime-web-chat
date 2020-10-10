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

//handle request in http server
async function handleRequest (req, res) {
  const url = req.url;
  if (url === '/') {
    const data = await readFile('./main.html');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write(data);
  }
  res.end();
}

// Create an HTTP server
const server = http.createServer();

server.on('request', handleRequest);

server.listen(8000, () => {
  console.log('Server running on port 8000...')
});

//create websocket

const ws = new WebSocket.Server({server});

ws.on('connection', (connection, req) => {
  const ip = req.socket.remoteAddress;
  //console.log(connection);

  connection.on('message', message => {
    const type = JSON.parse(message).type;
    if (type == 'sendMessage' || type == 'createGroup') {
      ws.clients.forEach(function each(client) {
        if (client !== connection && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } else {}
    
  });
  
  connection.on('close', () => {
    console.log(`Disconnected ${ip}`);
  });
});

