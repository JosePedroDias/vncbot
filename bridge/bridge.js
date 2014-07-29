(function() {

    'use strict';


    //console.log('1');



    var HOST = 'http://192.168.56.1:6688';



    var addScript = function(jsURL) {
        var headEl = document.getElementsByTagName('head')[0];
        var scriptEl = document.createElement('script');
        scriptEl.type = 'text/javascript';
        scriptEl.src = jsURL;// + '?' + ~~(Math.random()*99999);
        headEl.appendChild(scriptEl);
    };



    var cloneWithoutLoops = function(o) {
        /*var seen = [];

        var s = JSON.stringify(o, function(key, val) {
           if (val !== null && typeof val === 'object') {
                if (seen.indexOf(val) !== -1) { return; }
                seen.push(val);
            }
            return val;
        });

        return JSON.parse(s);*/

        return JSON.parse( CircularJSON.stringify(o, null, null, true) );
    };



    addScript(HOST + '/socket.io/socket.io.js');

    // https://github.com/WebReflection/circular-json
    //addScript('https://raw.githubusercontent.com/WebReflection/circular-json/master/build/circular-json.js');
    addScript('http://rawgit.com/WebReflection/circular-json/master/build/circular-json.js');



    setTimeout(function() {
        //console.log('2');
        
        var socket = io.connect('192.168.56.1:6688');

        socket.on('log', function(data) {
            //console.log('3');
            console.log('log', data);

            socket.emit('log', 'hi from the client');
        });

        socket.on('js', function(data) {
            /*jshint evil:true */
            console.log('js', JSON.stringify(data));

            try {
                var res = eval(data);
                console.log(res);
                socket.emit('data', cloneWithoutLoops(res)); // TODO
                // socket.emit('data', res);
            } catch(ex) {
                socket.emit('data', ex.toString());
            }
        });

    }, 1000);

})();
