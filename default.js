var async       = require('async');
var express 	= require('express');
var sense 		= require('ds18b20');
var gpio 		= require('rpi-gpio');

console.log('Hello.....');

var _app = express();

var _fanThreshold = 70;
var _deIcerThreshold = 69;

var _intervalCheck = 5000;

//pins
var _pinLed = 11;
var _pinFan = 16;
var _pinDeIcer = 18;
var _pinNumbers = [_pinFan, _pinDeIcer, _pinLed];

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
    pinInit(_pinNumbers);
	
	setTimeout(function() {
		gpio.write(_pinLed, true, writeComplete(_pinLed, 'led on'));
	}, 2000);

    setInterval(tempFunc, _intervalCheck);
}

function pinInit(pinNumbers) {

	pinNumbers.forEach( function (element, index, array) {
		gpio.write(element, false, writeComplete(element, 'off'));	
	})

	console.log('All pins initalized');
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
			shouldFanBeRunning(temp, relayController);
			shouldDeIcerBeRunning(temp, relayController);
		});
	});
}

function shouldFanBeRunning(temp, relay) {
	if ( temp <= _fanThreshold ) {
		relay.off(_pinFan);
	} else {
		relay.on(_pinFan);
	}
} 

function shouldDeIcerBeRunning(temp, relay) {
	if ( temp <= _deIcerThreshold ) {
		relay.off(_pinDeIcer);
	} else {
		relay.on(_pinDeIcer);
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

_app.get('/fan/on', function (req, res) {
  console.log('turning fan on');

  relay.on(_pinFan);
  
  res.send('fans on');
})

var server = _app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Radon Controller listening at http://%s:%s', host, port);

})

//gracefull exit
process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
   
   	pinInit(_pinNumbers);

	gpio.destroy(function() {
		console.log('Closed pins, now exit');
            return process.exit(0);
    });        
});