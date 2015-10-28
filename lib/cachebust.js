/*
 *
 * https://github.com/furzeface/cachebust
 *
 * Copyright (c) 2014 Daniel Furze
 * Licensed under the MIT license.]
 *
 */

'use strict';

var $ = require('cheerio'),
  MD5 = require('MD5'),
  fs = require('fs');

exports.busted = function(fileContents, options) {
  var self = this;

  options.basePath = options.basePath || "";

  if (options.type === 'timestamp') {
    self.timestamp = new Date().getTime();
  }

  var protocolRegEx = /^http(s)?/,
    scripts = $(fileContents).find('script'),
    styles = $(fileContents).find('link[rel=stylesheet]'),
    data;

 
  // Loop the stylesheet hrefs
  for (var i = 0; i < styles.length; i++) {
    var origHref = styles[i].attribs.href,
      styleHref = styles[i].attribs.href.split("?")[0];

    // Test for http(s) and don't cache bust if (assumed) served from CDN
    if (!protocolRegEx.test(styleHref)) {
      if (options.type === 'timestamp') {
        fileContents = fileContents.replace(origHref, styleHref + '?t=' + self.timestamp);
      } else {
        data = fs.readFileSync(options.basePath + styleHref).toString();
        fileContents = fileContents.replace(origHref, styleHref + '?v=' + MD5(data));
      }
    }
  }

  // Loop the script srcs
  for (var j = 0; j < scripts.length; j++) {
    //Do not consider script tag without src attribute : <script>...</script>
    if(scripts[j].attribs.src === undefined){ 
      continue;
    }

    var origSrc =  scripts[j].attribs.src,
      scriptSrc = scripts[j].attribs.src.split("?")[0];

    // Test for http(s) and don't cache bust if (assumed) served from CDN
    if (!protocolRegEx.test(scriptSrc)) {
      if (options.type === 'timestamp') {
        fileContents = fileContents.replace(origSrc, scriptSrc + '?t=' + self.timestamp);
      } else {
        data = fs.readFileSync(options.basePath + scriptSrc).toString();
        fileContents = fileContents.replace(origSrc, scriptSrc + '?v=' + MD5(data));
      }
    }
  }
 
  return fileContents;
};
