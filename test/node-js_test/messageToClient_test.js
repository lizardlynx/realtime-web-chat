'use strict';

const assert = require('assert').strict;
const messageToClient = require('../../node-js/messageToClient');
const MessageToClient = messageToClient.MessageToClient;
const InfoToClient = messageToClient.InfoToClient;
const TextToClient = messageToClient.TextToClient;
const SearchToClient = messageToClient.SearchToClient;

const messagesToClient = [
  new InfoToClient({
    type: 1,
    prop: 'value',
    info: 'Marina',
    id: 111 }),
  new TextToClient('Marina', 111, 'All', './images/anonymous.jpeg', 'World'),
  new SearchToClient([], false)];

//test message to client hierarchy
describe('MessageToClient hierarchy', () => {
  //check instances
  describe('MessageToClient', () => {
    it('instance of abstract Message To Client should throw err ', () => {
      assert.throws(() => new MessageToClient(), Error);
    });
  });

  for (let i = 0; i < messagesToClient.length; i++) {
    const mess = messagesToClient[i];
    const name = mess.constructor.name;
    describe(name, () => {
      it(name + ' should', () => {
        // add tests
      });
    });
  }
});
