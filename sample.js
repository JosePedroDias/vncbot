var vncbot = require('./vncbot');

var cfg = require('./cfg.json');



var clone = function(o) {
    return JSON.parse( JSON.stringify(o) );
};



var v = vncbot(cfg);



setTimeout(function() {

    if (1) {
        var stuff = 'echo "hello world"'.split('');
        stuff.push('enter');
        //v.sendKeysNow(stuff);
        v.sendKeys(stuff, 100);
    }



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
        v.sendPointers(points, 25);
    }



    /*v.update(0, 0, 128, 128, function(rect) {
        return '/tmp/128.png';
    });*/

    //v.redraw();
    
    /*v.redraw(function(rect) {
        return '/tmp/cenas.png';
    });*/


    setTimeout(function() { v.end(); }, 3000);

}, 500);
