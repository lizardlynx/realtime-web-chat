'use strict';
const http = require('http');
const WebSocket = require('ws');
const assert = require('assert').strict;
const Server = require('../../node-js/server').Server;

let server = null;
let socket = null;
let socket1 = null;
const dialogs = [
  ['111', 'All'],
  ['222', 'All'],
  ['111', '222'],
];

//tests on server http and websockets
describe('Server', () => {
  before(() => {
    server = new Server();
    server.upgradeServer();
    socket = new WebSocket('ws://localhost:8000');
    socket1 = new WebSocket('ws://localhost:8000');
  });
  after(() => {
    socket.close();
    socket1.close();
    server.close();
  });

  describe('http server', () => {
    //http
    it('status code should be 200', done => {
      http.get('http://localhost:8000/', res => {
        assert.equal(res.statusCode, 200);
      });
      done();
    });

    //test on close
    it('connection should close', done => {
      server.close();
      assert.strictEqual(server.server.listening, false);
      done();
    });
  });

  //websockets
  //check on search message and onConnection func ,first data sent to server
  it('should have type 4 and number of other online users 1', done => {
    socket1.once('open', () => {
      socket1.once('message', event => {
        const messageParsed = JSON.parse(event);
        if (messageParsed.type) {
          assert.strictEqual(messageParsed.list, 1);
        }
        done();
      });
    });
  });

  //check on text message to server
  it('should have type 3 and text `World`', done => {
    socket.once('message', event => {
      const messageParsed = JSON.parse(event);
      if (messageParsed.type) {
        assert.strictEqual(messageParsed.type, 3);
        assert.strictEqual(messageParsed.message, 'World');
      }
      done();
    });
    socket.send(JSON.stringify({
      type: 3,
      message: 'World',
      destination: 'All',
      id: 111 }));
  });

  //check on info message name to server
  it('should have type 1 and name `Marina`', done => {
    socket.once('message', event => {
      const messageParsed = JSON.parse(event).message;
      if (messageParsed.type) {
        assert.strictEqual(messageParsed.type, 1);
        assert.strictEqual(messageParsed.info, 'Marina');
      }
      done();
    });
    socket.send(JSON.stringify({
      type: 1,
      prop: 'value',
      info: 'Marina',
      id: 111 }));
  });

  //check on info message avatar to server
  it('should have type 2 and avatar `./images/anonymous.jpeg`', done => {
    socket.once('message', event => {
      const messageParsed = JSON.parse(event).message;
      if (messageParsed.type) {
        assert.strictEqual(messageParsed.type, 2);
        assert.strictEqual(messageParsed.info, './images/anonymous.jpeg');
      }
      done();
    });
    socket.send(JSON.stringify({
      type: 2,
      prop: 'src',
      info: './images/anonymous.jpeg',
      id: 111 }));
  });

  //on close connection send number of users
  it('should send to client number 0(other online users)', done => {
    socket.once('message', event => {
      const messageParsed = JSON.parse(event);
      if (messageParsed.type) {
        assert.strictEqual(messageParsed.list, 0);
      }
      done();
    });
    socket1.close();
  });

});

//tests on functions from server class
describe('Server class', () => {
  beforeEach(() => {
    server = new Server();
    server.upgradeServer();
    server.dialogs = dialogs;
  });
  afterEach(() => {
    server.close();
  });

  //test on instances
  it('should be Singleton', () => {
    const server1 = new Server();
    const server2 = new Server();
    assert.strictEqual(server1 === server2, true);
  });

  //tests on function dialogExists
  describe('dialogExists', () => {
    it('`111`, `All` should return existing dialog', () => {
      assert.strictEqual(server.dialogExists('111', 'All'), true);
    });

    it('111, `All` should return existing dialog', () => {
      assert.strictEqual(server.dialogExists(111, 'All'), true);
    });

    it('111, `222` should return existing dialog', () => {
      assert.strictEqual(server.dialogExists(111, '222'), true);
    });

    it('111, null should not return existing dialog', () => {
      assert.strictEqual(server.dialogExists(111, null), false);
    });

    it('4567, `hduhdu` should not return existing dialog', () => {
      assert.strictEqual(server.dialogExists(4567, 'hduhdu'), false);
    });
  });
});
