var fs     = require('fs');
var assert = require('assert');

var RFB    = require('rfb'); // https://github.com/substack/node-rfb/blob/master/index.js
var PNG    = require('png');



var DEBUG = 1;
var DEBUG_LOW = 0;
var DEBUG_WAITS = 1;



var keys = {
    backspace: 0xff08,
    tab      : 0xff09,
    enter    : 0xff0d,
    esc      : 0xff1b, // convenience
    escape   : 0xff1b,
    ins      : 0xff63, // convenience
    insert   : 0xff63,
    del      : 0xffff, // convenience
    'delete' : 0xffff,
    home     : 0xff50,
    end      : 0xff57,
    pageUp   : 0xff55,
    pageDown : 0xff56,
    left     : 0xff51,
    up       : 0xff52,
    right    : 0xff53,
    down     : 0xff54,
    f1       : 0xffbe,
    f2       : 0xffbf,
    f3       : 0xffc0,
    f4       : 0xffc1,
    f5       : 0xffc2,
    f6       : 0xffc3,
    f7       : 0xffc4,
    f8       : 0xffc5,
    f9       : 0xffc6,
    f10      : 0xffc7,
    f11      : 0xffc8,
    f12      : 0xffc9,
    shift    : 0xffe1, // convenience
    shiftL   : 0xffe1,
    shiftR   : 0xffe2,
    ctrl     : 0xffe3, // convenience 
    control  : 0xffe3, // convenience
    controlL : 0xffe3,
    controlR : 0xffe4,
    win      : 0xffe7, // convenience
    meta     : 0xffe7, // convenience
    metaL    : 0xffe7,
    metaR    : 0xffe8,
    alt      : 0xffe9,
    altGR    : 0xffea
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

var vncbot = function(cfg, onReadyCb) {

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
        if (onReadyCb) {
            onReadyCb(dims);
        }
    });

    

    var api = {

        // KEY INPUT

        sendKeysNow: function(queue) {
            queue.forEach(function(k) {
                if (DEBUG_LOW) { console.log('KEY: ' + k); }
                var kk = keyToHex(k);
                r.sendKey(kk, 1);
                r.sendKey(kk, 0);
            });
        },

        sendKeys: function(queue, dt, cb) {
            //console.log('QUEUE: ' + JSON.stringify(queue));
            var timer;
            if (!dt) { dt = 25; }

            var onTimer = function() {
                var k = queue.shift();
                var isDown;

                if (k === undefined) {
                    clearInterval(timer);
                    if (cb) { return cb(); } else { return; }
                }

                if (typeof k !== 'string' && k.length) {
                    isDown = !!k[1];
                    k = k[0];
                }

                if (DEBUG_LOW) {
                    if (isDown !== undefined) {
                        console.log('KEY: ' + k + ' ' + (isDown ? 1 : 0));
                    }
                    else {
                        console.log('KEY: ' + k);
                    }
                }

                k = keyToHex(k);

                if (isDown !== undefined) {
                    r.sendKey(k, isDown);
                }
                else {
                    r.sendKey(k, 1);
                    r.sendKey(k, 0);
                }
            };

            timer = setInterval(onTimer, dt);
        },

        sendKeyCommand: function(s, dt, cb) {
            var a = s.split('+');
            var b = clone(a).reverse();
            a = a.map(function(i) { return [i, 1]; });
            b = b.map(function(i) { return [i, 0]; });
            a = a.concat(b);
            api.sendKeys(a, dt, cb);
        },

        sendKey: function(k, isDown) {
            if (DEBUG_LOW) { console.log('KEY: ' + k + ' ' + (isDown ? 1 : 0) ); }
            if (typeof k === 'string') {
                k = keyToHex(k);
            }
            r.sendKey(k, isDown);
        },



        // POINTER INPUT

        sendPointers: function(queue, dt, cb) {
            var timer;

            var onTimer = function() {
                var p = queue.shift();
                if (p === undefined) {
                    clearInterval(timer);
                    if (cb) { return cb(); } else { return; }
                }
                if (DEBUG_LOW) { console.log('POINTER: ' + p); }
                r.sendPointer(p[0], p[1], p[2]); // x, y, mask
            };

            timer = setInterval(onTimer, dt);
        },

        sendPointer: function(x, y, mask) {
            r.sendPointer(x, y, mask);
        },

        sendClick: function(x, y) {
            r.sendPointer(x, y, 1);
            r.sendPointer(x, y, 0);
        },



        // SCREEN OUTPUT

        redraw: function(cb) {
            if (cb) {
                var k = [0, 0, dims[0], dims[1]].join('|');
                pendingScreens[k] = cb;
            }
            r.requestRedraw();
        },

        update: function(x, y, w, h, cb) {
            if (cb) {
                var k = [x, y, w, h].join('|');
                pendingScreens[k] = cb;
            }
            r.requestUpdate({x:x, y:y, width:w, height:h});
        },



        copyText: function(text) {
            r.copyText(text);
        },



        // WAITING

        wait: function(dt, cb) {
            if (!DEBUG_WAITS) {
                return setTimeout(cb, dt);
            }

            console.log('waiting ' + dt + ' ms...');
            setTimeout(function() {
                console.log('resuming');
                cb();
            }, dt);
        },



        // TERMINATE SESSION

        end: function() {
            r.end();
        }

    };

    return api;
};



module.exports = vncbot;