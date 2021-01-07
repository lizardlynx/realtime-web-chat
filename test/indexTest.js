'use strict';
const assert = require('assert');
const index = require('../index');
describe('Index', () => {
  it('index should return hello', () => {
    const result = index();
    assert.strictEqual(result, 'hello');
  });
});
