/*
 *
 * https://github.com/furzeface/cachebust
 *
 * Copyright (c) 2014 Daniel Furze
 * Licensed under the MIT license.]
 *
 */

'use strict';

var cheerio = require('cheerio'),
  MD5 = require('md5'),
  fs = require('fs');

function loadAttribute(content) {
  if (content.name.toLowerCase() === 'link') {
    return content.attribs.href;
  }


  if (content.name.toLowerCase() === 'script') {
    return content.attribs.src;
  }

  throw "No content awaited in this step of process";
}


exports.busted = function(fileContents, options) {
  var self = this, $ = cheerio.load(fileContents);

  self.MD5 = function(fileContents, originalAttrValue, options) {
    var originalAttrValueWithoutCacheBusting = originalAttrValue.split("?")[0],
        hash = MD5(fs.readFileSync(options.basePath + originalAttrValueWithoutCacheBusting).toString());

    return fileContents.replace(originalAttrValue, originalAttrValueWithoutCacheBusting + '?v=' + hash);
  };

  self.timestamp = function(fileContents, originalAttrValue, options) {
    var originalAttrValueWithoutCacheBusting = originalAttrValue.split("?")[0];
    return fileContents.replace(originalAttrValue, originalAttrValueWithoutCacheBusting + '?t=' + options.currentTimestamp);
  };

  options = {
    basePath : options.basePath || "",
    type : options.type || "MD5",
    currentTimestamp : new Date().getTime()
  };

  var protocolRegEx = /^http(s)?/, elements = $('script[src], link[rel=stylesheet][href]');

  for (var i = 0, len = elements.length; i < len; i++) {
    var originalAttrValue = loadAttribute(elements[i]);

    // Test for http(s) and don't cache bust if (assumed) served from CDN
    if (!protocolRegEx.test(originalAttrValue)) {
      fileContents = self[options.type](fileContents, originalAttrValue, options);
    }
  }

  return fileContents;
};
