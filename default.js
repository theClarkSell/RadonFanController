var async       = require('async');
var express 	= require('express');
var sense 		= require('ds18b20');
var gpio 		= require('rpi-gpio');

console.log('Starting.....');

var _app = express();

var _tempTrigger = 90;
var _intervalCheck = 10000;

//pings
var _pinFan = 22;
var _pinDeIcer = 00;

var _override = false;

function run() {

	//Init all the pins
    //pinInit([_pinFan, 11]);

    //turn the LED on
	gpio.write(11, true, writeComplete(11, 'led on'));

    setInterval(tempFunc, _intervalCheck);
}

function pinInit(pinNumbers) {

	for (pin in pinNumbers) {
		gpio.write(pin, false, writeComplete(pin, 'off'));	
	}

	console.log('All pins set up');
}

function writeComplete (pinNumber, message) {
	console.log('pin:', pinNumber, '--', message);
}

async.parallel([
    function(callback) {
        gpio.setup(_pinFan, gpio.DIR_OUT, callback);
    },

    function(callback) {
        gpio.setup(11, gpio.DIR_OUT, callback);
    }

], function(err, results) {

    //Kick off things...
    run();
});

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

  console.log('Example app listening at http://%s:%s', host, port);

})