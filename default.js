var express = require('express');
var sense = require('ds18b20');
var gpio = require('rpi-gpio');

console.log(Date.now(), '>> Starting...');

var _tempTrigger = 90;
var _intervalCheck = 5000;

var _pinFan = 22;
var _pinDeIcer = 00;

var _override = false;

var app = express();

function run() {
    setInterval(tempFunc, _intervalCheck);
}

function onSetup (error) {
	console.log(error);
	console.log('pin setup');
}

function done() {
	console.log('pin written');
}


//turn on the LED:
gpio.setup(_pinFan, gpio.DIR_OUT, onSetup);

//just a test...
/*
var _ledPin = 7;
gpio.setup(_ledPin, gpio.DIR_OUT, onSetup);
gpio.write(_ledPin, true, done);
*/

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
		console.log ('turning relay on'); 
		gpio.write(pin, true, done);
	},
	
	off: function (pin) { 
		console.log ('turning relay off'); 
		gpio.write(pin, false, done);
	}
}

//EXPRESS 
app.get('/', function (req, res) {
  res.send('Hello World!');
})

var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

})


run();