/*
 *
 * https://github.com/furzeface/cachebust
 *
 * Copyright (c) 2014 Daniel Furze
 * Licensed under the MIT license.]
 *
 * @todo Detect if there's already a query string
 */

'use strict';

var $ = require('cheerio'),
MD5 = require('MD5'),
exec = require('sync-exec');

exports.busted = function(fileContents, options) {
  var self = this;

  if (options.type === 'timestamp') {
    self.timestamp = new Date().getTime();
  }

  if (options.type === 'git-digest') {
    var execOutput = exec('git rev-parse --short HEAD');
    if (execOutput.stderr) {
      throw execOutput.stderr;
    } else {
      self.gitDigest = execOutput.stdout;
      //remove '\n'
      self.gitDigest = self.gitDigest.substr(0, self.gitDigest.length - 1);
    }
  }

  var protocolRegEx = /^http(s)?/,
  $scripts = $(fileContents).find('script'),
  $styles = $(fileContents).find('link[rel=stylesheet]');

  // Loop the stylesheet hrefs
  for (var i = 0; i < $styles.length; i++) {
    var styleHref = $styles[i].attribs.href;

    // Test for http(s) and don't cache bust if (assumed) served from CDN
    if (!protocolRegEx.test(styleHref)) {
      if (options.type === 'timestamp') {
        fileContents = fileContents.replace(styleHref, styleHref + '?t=' + self.timestamp);
      } else if (options.type === 'git-digest') {
        fileContents = fileContents.replace(styleHref, styleHref + '?v=' + self.gitDigest);
      } else {
        fileContents = fileContents.replace(styleHref, styleHref + '?hash=' + MD5(fileContents));
      }
    }
  }

  // Loop the script srcs
  for (var j = 0; j < $scripts.length; j++) {
    var scriptSrc = $scripts[j].attribs.src;

    // Test for http(s) and don't cache bust if (assumed) served from CDN
    if (!protocolRegEx.test(scriptSrc)) {
      if (options.type === 'timestamp') {
        fileContents = fileContents.replace(scriptSrc, scriptSrc + '?t=' + self.timestamp);
      } else if (options.type === 'git-digest') {
        fileContents = fileContents.replace(scriptSrc, scriptSrc + '?v=' + self.gitDigest);
      } else {
        fileContents = fileContents.replace(scriptSrc, scriptSrc + '?hash=' + MD5(fileContents));
      }
    }
  }

  return fileContents;
};
