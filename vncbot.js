var fs     = require('fs');
var assert = require('assert');

var RFB    = require('rfb'); // https://github.com/substack/node-rfb/blob/master/index.js
var PNG    = require('png');



var DEBUG = 0;



var keys = {
    backspace     : 0xff08,
    bs            : 0xff08,
    tab           : 0xff09,
    'return'      : 0xff0d,
    enter         : 0xff0d,
    escape        : 0xff1b,
    insert        : 0xff63,
    'delete'      : 0xffff,
    del           : 0xffff,
    home          : 0xff50,
    end           : 0xff57,
    page_up       : 0xff55,
    page_down     : 0xff56,
    left          : 0xff51,
    up            : 0xff52,
    right         : 0xff53,
    down          : 0xff54,
    f1            : 0xffbe,
    f2            : 0xffbf,
    f3            : 0xffc0,
    f4            : 0xffc1,
    f5            : 0xffc2,
    f6            : 0xffc3,
    f7            : 0xffc4,
    f8            : 0xffc5,
    f9            : 0xffc6,
    f10           : 0xffc7,
    f11           : 0xffc8,
    f12           : 0xffc9,
    shift_left    : 0xffe1,
    shift_right   : 0xffe2,
    control_left  : 0xffe3,
    control_right : 0xffe4,
    meta_left     : 0xffe7,
    meta_right    : 0xffe8,
    alt           : 0xffe9,
    alt_left      : 0xffe9,
    alt_right     : 0xffea,
    alt_gr        : 0xffea
};



var clone = function(o) {
    return JSON.parse( JSON.stringify(o) );
};



var keyToHex = function(s) {
    var c = keys[s];
    if (c) { return c; }
    return s.charCodeAt(0);
};



var setRectAlpha = function(rect) {
    var f = rect.fb;
    var I = rect.width * rect.height;
    var j, t;
    for (var i = 0; i < I; ++i) {
        j = i * 4;
        f[j + 3] = 0;
    }
};



var saveRectNow = function(rect, path) {
    var png = new PNG.Png(rect.fb, rect.width, rect.height, 'bgra'); // rgba bgra
    setRectAlpha(rect);
    var data = png.encodeSync();
    fs.writeFileSync(path, data, 'binary');
    if (DEBUG) {
        console.log('saved ' + rect.width + 'x' + rect.height + ' to ' + path);
    }
};



var saveRect = function(rect, path, cb) {
    var png = new PNG.Png(rect.fb, rect.width, rect.height, 'bgra'); // rgba bgra
    setRectAlpha(rect);
    png.encode(function(data) {
        fs.writeFile(path, data, 'binary', function(err) {
            if (cb) {
                cb(err);
            }
            if (DEBUG && !err) {
                console.log('saved ' + rect.width + 'x' + rect.height + ' to ' + path);
            }
        });
    });
};





var pendingScreens = {};

var dims = [1, 1];

var vncbot = function(cfg) {

    var r = new RFB(cfg);



    r.on('raw', function(rect) {
        assert.equal(rect.bitsPerPixel, 32);

        var k = [rect.x, rect.y, rect.width, rect.height].join('|');
        if (DEBUG) {
            console.log('-> RAW ' + k);
        }
        var cb = pendingScreens[k];
        if (cb) {
            if (DEBUG) { console.log('w/ cb'); }
            var result = cb(rect);
            if (result) {
                saveRect(rect, result);
            }
        }
        else {
            if (DEBUG) { console.log('wo/ cb'); }
        }
    });

    r.on('error', function(err) {
        console.error('ERROR', err);
    });

    r.on('end', function() {
        console.log('ENDED');
    });



    r.dimensions(function(_dims) {
        dims[0] = _dims.width;
        dims[1] = _dims.height;
        if (DEBUG) { console.log('DIMS: ' + dims.join('x')); }
    });

    

    var api = {

        // KEY INPUT

        sendKeysNow: function(queue) {
            queue.forEach(function(k) {
                var kk = keyToHex(k);
                r.sendKey(kk, 1);
                r.sendKey(kk, 0);
            });
        },

        sendKeys: function(queue, dt) {
            var timer;

            var onTimer = function() {
                var k = queue.shift();
                if (k === undefined) {
                    return clearInterval(timer);
                }
                if (DEBUG) { console.log('KEY: ' + k); }
                k = keyToHex(k);
                r.sendKey(k, 1);
                r.sendKey(k, 0);
            };

            timer = setInterval(onTimer, dt);
        },

        sendKey: function(k, isDown) {
            if (typeof k === 'string') {
                k = keyToHex(k);
            }
            r.sendKey(k, isDown);
        },



        // POINTER INPUT

        sendPointers: function(queue, dt) {
            var timer;

            var onTimer = function() {
                var p = queue.shift();
                if (p === undefined) {
                    return clearInterval(timer);
                }
                if (DEBUG) { console.log('POINTER: ' + p); }
                r.sendPointer(p[0], p[1], p[2]); // x, y, mask
            };

            timer = setInterval(onTimer, dt);
        },

        sendPointer: function(x, y, mask) {
            r.sendPointer(x, y, mask);
        },



        // SCREEN OUTPUT

        redraw: function(cb) {
            var k = [0, 0, dims[0], dims[1]].join('|');
            pendingScreens[k] = cb;
            r.requestRedraw();
        },

        update: function(x, y, w, h, cb) {
            var k = [x, y, w, h].join('|');
            pendingScreens[k] = cb;
            r.requestUpdate({x:x, y:y, width:w, height:h});
        },


        
        end: function() {
            r.end();
        }

    };

    return api;
};



module.exports = vncbot;