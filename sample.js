var vncbot = require('./vncbot');

var cfg = require('./cfg.json');



var clone = function(o) {
    return JSON.parse( JSON.stringify(o) );
};

var andEnter = function(text) {
    return text.split('').concat(['enter']);
};

var lines = function(lines) {
    /*jshint boss:true */
    var line, res = [];
    while (line = lines.shift()) {
        res = res.concat( line.split('') );
        res.push('enter');
    }
    return res;
};

var runInWindows = function(cmd, cb) {
    v.sendKeyCommand('ctrl+esc', 10, function() {
        v.sendKeys(andEnter(cmd), 10, function() {
            v.wait(2000, cb);
        });
    });
};



var v = vncbot(cfg, function(dims) {

    console.log('firing notepad...');
    runInWindows('notepad', function() {
        console.log('writing text...');
        v.sendKeys(lines(['era uma vez', 'um gato maltez']), 100, function() {
            v.wait(2000, function() {
                console.log('closing notepad');
                v.sendKeyCommand('alt+f4', 50, function() {
                    v.sendKeys(['tab', 'enter'], 50, function() {

                        console.log('firing paint...');
                        runInWindows('paint', function() {

                            console.log('drawing a circle...');
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

                            v.sendPointers(points, 25, function() {
                                v.wait(2000, function() {
                                    console.log('closing paint');
                                    v.sendKeyCommand('alt+f4', 50, function() {
                                        v.sendKeys(['tab', 'enter'], 50, function() {
                                            console.log('ALL DONE!');
                                        });
                                    });
                                })
                            });
                        });
                    });
                });
            });
        });
    });
});
