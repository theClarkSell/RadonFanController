var async       = require('async');
var express 	= require('express');
var sense 		= require('ds18b20');
var gpio 		= require('rpi-gpio');


console.log('Starting.....');

var _app = express();

var _tempTrigger = 90;
var _intervalCheck = 5000;

//pins
var _pinLed = 11;
var _pinFan = 16;
var _pinDeIcer = 18;

var _override = false;



async.parallel([
    function(callback) {
        gpio.setup(_pinFan, gpio.DIR_OUT, callback);
    },

    function(callback) {
        gpio.setup(_pinDeIcer, gpio.DIR_OUT, callback);
    },
    
    function(callback) {
        gpio.setup(_pinLed, gpio.DIR_OUT, callback);
    }

], function(err, results) {

	setTimeout(function() {
		console.log('waiting 5 seconds for pins to export');
		run();
	}, _intervalCheck);

});

function run() {
    pinInit([_pinFan, _pinDeIcer, _pinLed]);
	gpio.write(_pinLed, true, writeComplete(_pinLed, 'led on'));

    setInterval(tempFunc, _intervalCheck);
}

function pinInit(pinNumbers) {

	pinNumbers.forEach( function (element, index, array) {
		gpio.write(element, false, writeComplete(element, 'off'));	
	})

	console.log('All pins set up');
}

function writeComplete (pinNumber, message) {
	console.log('pin:', pinNumber, '--', message);
}

var tempFunc = function () {
	console.log(Date.now(), '>> checking temp');

	sense.sensors(function(err, ids) {
		sense.temperature(ids, function(err, value) {
			var temp = value * 9 / 5 + 32;
			console.log('Current temperature is: ', temp);

			//Check the temp and kill the fan
			isTempToCold(temp, relayController);
		});
	});
}

var isTempToCold = function (temp, relay) {
	if ( temp <= _tempTrigger ) {
		relay.off(_pinFan);
	} else {
		relay.on(_pinFan);
	}
} 

var relayController = {
	on: function (pin) {  
		gpio.write(pin, true, writeComplete(pin, 'on'));
	},
	
	off: function (pin) { 
		gpio.write(pin, false, writeComplete(pin, 'off'));
	}
}

//EXPRESS 
_app.get('/', function (req, res) {
  res.send('Hello World!');
})

var server = _app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Radon Controller listening at http://%s:%s', host, port);

})

//gracefull exit
process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
   
	gpio.destroy(function() {
		console.log('Closed pins, now exit');
            return process.exit(0);
    });        
});