var fs     = require('fs');
var assert = require('assert');

var RFB    = require('rfb'); // https://github.com/substack/node-rfb/blob/master/index.js
var PNG    = require('png');

var cfg    = require('./cfg.json');
var keys   = require('./keys');


// http://www.realvnc.com/docs/rfbproto.pdf



var r = new RFB(cfg);

var DEBUG = 1;



var clone = function(o) {
    return JSON.parse( JSON.stringify(o) );
};



var keyToHex = function(s) {
    var c = keys[s];
    if (c) { return c; }
    return s.charCodeAt(0);
};

var sendKeys = function(arr) {
    arr.forEach(function(k) {
        var kk = keyToHex(k);
        r.sendKey(kk, 1);
        r.sendKey(kk, 0);
    });
};

var sendKeys2 = function(queue, dt) {
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
};

var sendPointers = function(queue, dt) {
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
};



r.on('error', function(err) {
    console.error('ERROR', err);
});

r.on('end', function() {
    console.log('ENDED');
});



setTimeout(function() {

    r.dimensions(function(dims) {
        console.log('DIMS: ' + dims.width + 'x' + dims.height);
    });



    var saveRect = function(rect, path) {
        var png = new PNG.Png(rect.fb, rect.width, rect.height, 'bgra'); // rgba bgra

        var f = rect.fb;
        var I = rect.width * rect.height;
        var j, t;
        for (var i = 0; i < I; ++i) {
            j = i * 4;
            f[j + 3] = 0;
        }

        var data = png.encodeSync();
        fs.writeFileSync(path, data, 'binary');
        console.log('saved ' + rect.width + 'x' + rect.height + ' to ' + path);
    };



    r.on('raw', function(rect) {
        //console.log('-> RAW');
        assert.equal(rect.bitsPerPixel, 32);
        saveRect(rect, '/tmp/x.png');
    });



    /*r.sendKeyDown(k);
    r.sendKeyUp(k);*/

    if (1) {
        var stuff = 'echo "hello world"'.split('');
        stuff.push('enter');
        //sendKeys(stuff);
        sendKeys2(stuff, 100);
    }



    //r.sendPointer(20, 40, 0); // x, y, mask
    
    if (0) {
        var points = [];
        (function() {
            var I = 32;
            var r = 100;
            var a;
            var da = Math.PI * 2 / I;
            var ctr = [300, 250];
            for (var i = 0; i < I; ++i) {
                a = i * da;
                points.push([
                    Math.round( ctr[0] + r * Math.cos(a) ),
                    Math.round( ctr[1] + r * Math.sin(a) ),
                    1
                ]);
            }
        })();
        var p = clone(points[0]);
        p[2] = 0;
        points.unshift(p);
        points.push(p);
        sendPointers(points, 25);
    }



    //r.requestUpdate({x:0, y:0, width:128, height:128});

    r.requestRedraw();


    //r.end();

}, 1000);
