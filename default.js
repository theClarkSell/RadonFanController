var async       = require('async');
var express 	= require('express');
var sense 		= require('ds18b20');
var gpio 		= require('rpi-gpio');

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

function writeComplete () {
	console.log('pin written');
}

async.parallel([
    function(callback) {
        gpio.setup(_pinFan, gpio.DIR_OUT, callback)
    },
    function(callback) {
        gpio.setup(11, gpio.DIR_OUT, callback)
    },
    function(callback) {
        //gpio.setup(16, gpio.DIR_OUT, callback)
    },
], function(err, results) {
    console.log('All pins set up');

    //turn the LED on
	gpio.write(11, true, writeComplete);
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
		console.log ('turning relay on'); 
		gpio.write(pin, true, writeComplete);
	},
	
	off: function (pin) { 
		console.log ('turning relay off'); 
		gpio.write(pin, false, writeComplete);
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