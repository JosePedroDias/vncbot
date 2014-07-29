var http     = require('http');
var repl     = require('repl');
var express  = require('express');
var socketio = require('socket.io');



var runApp = function(v) {
    var app = express();
    var server = http.Server(app);
    var io = socketio(server);
    io.set('origins', '*:*');

    server.listen(6688);

    app.get('/bridge.js', function(req, res) {
        //console.log('SENDING BRIDGE');
        res.sendfile(__dirname + '/bridge.js');
    });



    var lastSocket;
    var waitingCb;

    io.on('connection', function(socket) {
        console.log('new connection');

        lastSocket = socket;

        socket.emit('log', 'hello world');

        socket.on('log', function(data) {
            console.log('log', data);
        });

        socket.on('data', function(data) {
            if (waitingCb) {
                waitingCb(null, JSON.stringify(data) );
                waitingCb = undefined;
                return;
            }

            console.log('< ', JSON.stringify(data));
        });
    });



    io.on('disconnection', function(socket) {
        console.log('disconnection');
        lastSocket = undefined;
    });



    var r = repl.start({
        prompt:   '> ',
        input:    process.stdin,
        output:   process.stdout,
        terminal: true,
        eval: function(cmd, ctx, filename, cb) {
            var l = cmd.length;
            cmd = cmd.substring(1, l-2);

            //console.log('[' + JSON.stringify(cmd) + ']');

            if (cmd.indexOf('quit') === 0) {
                return cb(null);
            }

            if (cmd.indexOf('shot ') === 0) {
                cb(null);
                cmd = cmd.split(' ');
                var x = parseInt(cmd[1], 10);
                var y = parseInt(cmd[2], 10);
                var w = parseInt(cmd[3], 10);
                var h = parseInt(cmd[4], 10);
                return v.update(x, y, w, h, function(rect) {
                    return '/tmp/' + ~~(Math.random()*100000) + '.png';
                });
            }

            if (cmd.indexOf('shot') === 0) {
                cb(null);
                return v.redraw(function(rect) {
                    return '/tmp/' + ~~(Math.random()*100000) + '.png';
                });
            }

            if (cmd.indexOf('log ') === 0) {
                if (lastSocket) {
                    lastSocket.emit('log',cmd.substring(4));
                }
                else {
                    cb(null, 'no socket available?');
                }
            }


            waitingCb = cb;

            if (lastSocket) {
                lastSocket.emit('js', cmd);
            }
            else {
                cb(null, 'no socket available?');
            }
        }
    });
};



module.exports = runApp;
