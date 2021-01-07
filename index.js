'use strict';

const ServerFuncs = require('./node-js/serverFuncs').ServerFuncs;
const http = require('http');
const WebSocket = require('ws');

//create and start chat server


module.exports = () => 'hello';


const serverFuncs = new ServerFuncs();

// Create an HTTP server
const server = http.createServer();
server.on('request', serverFuncs.handleRequest);
server.listen(process.env.PORT || 8000, () => {
  console.log('Server running (on port 8000)...');
});

//create websocket
const ws = new WebSocket.Server({ server });
setInterval(() => serverFuncs.onConnection(ws), 5000);
ws.on('connection', connection => {
  serverFuncs.onConnection(ws, connection);
  //message from client
  connection.on('message', mess => {
    console.log('new message');
    serverFuncs.connectionMessage(ws, connection, mess);
  });

  //client leaves
  connection.on('close', () => serverFuncs.connectionClose(ws, connection));
});

