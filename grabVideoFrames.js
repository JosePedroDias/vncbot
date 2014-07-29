var vncbot = require('./vncbot');

var cfg = require('./cfg.json');

var runApp = require('./bridge/app');



var andEnter = function(text) {
    return text.split('').concat(['enter']);
};

var lines = function(lines) {
    var line, res = [];
    while (line = lines.shift()) {
        res = res.concat( line.split('') );
        res.push('enter');
    }
    return res;
};



var SCRIPT_URL = 'http://192.168.56.1:6688/bridge.js';
var bookmarklet = "javascript:(function(){var head=document.getElementsByTagName('head')[0],script=document.createElement('script');script.type='text/javascript';script.src='" + SCRIPT_URL + "?' + Math.floor(Math.random()*99999);head.appendChild(script);})(); void 0";




var v = vncbot(cfg, function() {

    //v.sendKeyCommand('alt+tab');

    /*v.sendKeyCommand('ctrl+esc', 50, function() {
        v.sendKeys(andEnter('iexplore'), 50, function() {
            v.wait(2000, function() {
                v.sendKeyCommand('alt+d', 50, function() {
                    v.sendKeys(andEnter('http://videos.sapo.pt/9jOwistOA5Z8ED7JTjHz'), 50, function() {
                        console.log('ON THE PAGE');*/

                        v.sendKeyCommand('alt+d', 50, function() {
                            v.sendKeys(andEnter(bookmarklet), 10, function() {
                                console.log('OWNED');
                            });
                        });
                    /*});
                });
            });
        });
    });*/

});



runApp(v);



/*

// trying to get the box to crop for the element e...
window.e = document.querySelector('iframe');
window.o = e.getBoundingClientRect();
[~~(o.left + (window.screenX | window.screenLeft) + (window.outerWidth - window.innerWidth)), ~~(o.top + (window.screenY | window.screenHeight) + (window.outerHeight - window.innerHeight)), ~~(o.width), ~~(o.height)].join(' ')

*/