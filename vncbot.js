var fs     = require('fs');
var assert = require('assert');

var RFB    = require('rfb'); // https://github.com/substack/node-rfb/blob/master/index.js
var PNG    = require('png');

var keys   = require('./keys');



var clone = function(o) {
    return JSON.parse( JSON.stringify(o) );
};



var keyToHex = function(s) {
    var c = keys[s];
    if (c) { return c; }
    return s.charCodeAt(0);
};



var vncbot = function(cfg) {

    var r = new RFB(cfg);

    r.on('error', function(err) {
        console.error('ERROR', err);
    });

    r.on('end', function() {
        console.log('ENDED');
    });

    

    var api = {

    };

    return api;
};



module.exports = vncbot;