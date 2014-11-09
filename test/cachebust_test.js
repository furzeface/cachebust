/*global describe,it*/

'use strict';

var assert = require('assert'),
cachebust = require('../lib/cachebust.js');

describe('cachebust node module.', function () {
  it('must return HTML with query strings appended to asset URLs', function() {
    assert.notEqual(cachebust.busted(), 'awesome');
  });
});
