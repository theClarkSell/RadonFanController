var async       		= require('async');
var express 			= require('express');
var sense 				= require('ds18b20');
var gpio 				= require('rpi-gpio');
var controllerSettings 	= require('./controllerSettings');

console.log('Started...');

var settings = controllerSettings();

async.parallel([
    function(callback) {
        gpio.setup(settings.gpio.fan, gpio.DIR_OUT, callback);
    },

    function(callback) {
        gpio.setup(settings.gpio.deIcer, gpio.DIR_OUT, callback);
    },

    function(callback) {
        gpio.setup(settings.gpio.ledOn, gpio.DIR_OUT, callback);
    }

], function(err, results) {

	if (err) return next(err);
	run();
	/*
	setTimeout(function() {
		console.log('waiting 5 seconds for pins to export');
		run();
	}, settings.checkInterval);
	*/

});

function run() {
    pinInit();
    setInterval(tempFunc, settings.checkInterval);
}

//should pass in the pins so we can test better....
function pinInit() {

	async.forEach(Object.keys(settings.gpio), function(pin, callback) { 
    	var pinNumber = settings.gpio[pin];
        gpio.write(pinNumber, false, writeComplete(pinNumber, 'off'));	
        callback();

    }, function(err) {
        if (err) return next(err); //need to figure this out
    	
    	console.log('All pins initalized');
    	gpio.write(settings.gpio.ledOn, true, writeComplete(settings.gpio.ledOn, 'led on'));
    });
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

			//Check the temp and kill the fan // this could be pulled out into a callback
			shouldFanBeRunning(temp, relayController);
			shouldDeIcerBeRunning(temp, relayController);
		});
	});
}

function shouldFanBeRunning(temp, relay) {
	var fanPin = settings.gpio.fan,
		threshold = settings.fanThreshold;

	if ( temp <= threshold ) {
		relay.off(fanPin);
	} else {
		relay.on(fanPin);
	}
} 

function shouldDeIcerBeRunning(temp, relay) {
	var deIcer = settings.gpio.deIcer,
		threshold = settings.fanThreshold;

	if ( temp <= threshold ) {
		relay.off(deIcer);
	} else {
		relay.on(deIcer);
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

//gracefull exit
process.on('SIGINT', function() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
   
	async.forEach(Object.keys(settings.gpio), function(pin, callback) { 
    	var pinNumber = settings.gpio[pin];
        gpio.write(pinNumber, false, writeComplete(pinNumber, 'off'));	
        callback();

    }, function(err) {
        gpio.destroy(function() {
			console.log('Closed pins, now exit');
            return process.exit(0);
    	});        
    });
});