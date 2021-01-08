'use strict';
const http = require('http');
const WebSocket = require('ws');
const assert = require('assert').strict;
const Server = require('../../node-js/server').Server;

let server = null;
let socket = null;
const dialogs = [
  ['111', 'All'],
  ['222', 'All'],
  ['111', '222'],
  ['333', '111'],
];

//tests on server http and websockets
describe('Server', () => {
  before(() => {
    server = new Server();
    server.upgradeServer();
    socket = new WebSocket('ws://localhost:8000');
  });
  after(() => server.close());

  describe('main page', () => {
    //http
    it('status code should be 200', done => {
      http.get('http://localhost:8000/', res => {
        assert.equal(res.statusCode, 200);
      });
      done();
    });
  });

  //websockets
  //check on search message , first data sent to server
  it('should have type 4', done => {
    socket.once('open', () => {
      socket.once('message', event => {
        const messageParsed = JSON.parse(event);
        if (messageParsed.type) {
          assert.strictEqual(messageParsed.type, 4);
        }
        done();
      });
    });
  });

  //check on text message to server
  it('should have type 3 and content `World`', done => {
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
  it('should have type 1 and content `Marina`', done => {
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
  it('should have type 1 and content `./images/anonymous.jpeg`', done => {
    socket.once('message', event => {
      const messageParsed = JSON.parse(event).message;
      if (messageParsed.type) {
        assert.strictEqual(messageParsed.type, 1);
        assert.strictEqual(messageParsed.info, './images/anonymous.jpeg');
      }
      done();
    });
    socket.send(JSON.stringify({
      type: 1,
      prop: 'src',
      info: './images/anonymous.jpeg',
      id: 111 }));
  });

});

//tests on functions from server class
describe('Server class', () => {
  beforeEach(() => {
    server = new Server();
    server.dialogs = dialogs;
  });
  after(() => server.close());

  //test on instances
  it('should be Singleton', async () => {
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
