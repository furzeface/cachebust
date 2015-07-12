#! /usr/bin/env node

'use strict';

var cachebust = require('./lib/cachebust'),
  fs = require('fs'),
  filePath;

if (process.argv[2] === undefined) {
  return console.log('Supply an html file as the first argument');
}

filePath = process.argv[2];

if (filePath.indexOf('.html') > -1) {
  var options = {
    basePath: 'test/fixtures/',
    type: (process.argv[3]) ? process.argv[3] : 'MD5'
  };

  fs.readFile(filePath, 'utf8', function (err, html) {
    if (err) {
      throw err;
    }
    console.log(cachebust.busted(html, options));
  });
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
  return console.log(require('./package').version);
}
