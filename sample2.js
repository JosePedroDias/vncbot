var vncbot = require('./vncbot');

var cfg = require('./cfg.json');




var v = vncbot(cfg, function(dims) {

    v.wait(500, function() {
        console.log('...');
        v.copyText('hello world');
    });
});
