var vncbot = require('./vncbot');

var cfg = require('./cfg.json');

var runApp = require('./bridge/app');



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



var HOST = 'http://192.168.56.1:6688'; // 443
var SCRIPT_URL = HOST + '/bridge.js';
var PURPLE_URL = HOST + '/purple.html';

var TARGET_URL = 'http://js.sapo.pt/Projects/Video/140708R1/sample/main.html';
// var TARGET_URL = 'https://www.youtube.com/watch?v=90NsjKvz9Ns';

var bookmarklet = "javascript:(function(){var head=document.getElementsByTagName('head')[0],script=document.createElement('script');script.type='text/javascript';script.src='" + SCRIPT_URL + "?" + Math.floor(Math.random()*99999) + "';head.appendChild(script);})(); void 0";

var IE      = 'iexplore';
var CHROME  = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
var FIREFOX = '';

var SCREEN_DIMS;
var BROWSER_GAP;



var runInWindows = function(cmd, cb) {
    v.sendKeyCommand('ctrl+esc', 20, function() {
        v.sendKeys(andEnter(cmd), 20, function() {
            v.wait(2000, cb);
        });
    });
};

var goToUrl = function(url, cb) {
    console.log('GOING TO URL ' + url);
    v.sendKeyCommand('alt+d', 20, function() {
        v.sendKeys(andEnter(url), 20, function() {
            v.wait(2000, cb);
        });
    });
};

var ownBrowser = function(cb) {
    goToUrl(bookmarklet, cb || function() {});
};

var measureBrowser = function(cb) {
    goToUrl(PURPLE_URL, function() {
        var xc = ~~(SCREEN_DIMS[0] / 2);
        var yc = ~~(SCREEN_DIMS[1] / 2);
        //console.log(xc, yc);
        v.sendClick(xc, yc);
    });
};



//1)
var v = vncbot(
    cfg,
    function(dims) { // onReady
        console.log('');

        SCREEN_DIMS = dims;

        //v.wait(500, function() {
        runInWindows(CHROME, function() {
            measureBrowser(function() { /*2)*/ });
        });
    }
);



runApp(
    v, // vncbot instance
    {
        onOwn: function() {
            ownBrowser();
        },
        onBrowserGap: function(dims) {
            console.log('BROWSER GAP REPORTED: ' + dims.join('x'));

            BROWSER_GAP = dims;

            //3)
            goToUrl(TARGET_URL, function() {

                v.redraw();

                ownBrowser(function() {
                    console.log('DONE');
                    console.log("  window.g = [" + BROWSER_GAP.join(', ') + ']');
                    // console.log("  window.e = document.querySelector('video')");
                    console.log("  window.e = document.querySelector('iframe')");
                    console.log("  window.d = e.getBoundingClientRect()");
                    console.log("  ['shot', ~~(g[0] + d.left + 0.5),~~(g[1] + d.top + 0.5), ~~(d.width + 0.5), ~~(d.height + 0.5)].join(' ')");
                    
                    // SELECT VIDEO ELEMENT
                    // MEASURE IT
                    // TAKE SCREENSHOT
                    // PLAY
                    // TAKE SCREENSHOTS UNTIL DURATION
                });
            });
        }
    }
);
