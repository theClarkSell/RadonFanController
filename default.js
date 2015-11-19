var async       		= require('async');
var express 			= require('express');
var sense 				= require('ds18b20');
var gpio 				= require('rpi-gpio');
var http				= require('http');
var https				= require('https');
var consoleColors		= require('colors');
var argv 				= require('minimist')(process.argv.slice(2));

//3rd party services
var m2x 				= require('m2x');

//our modules
var controllerSettings 	= require('./controllerSettings');
var adc					= require('./adc');
var gitHooks			= require('./git');
var m2x					= require('./m2x');
var everlive 			= require('./everlive');

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
});

function run() {
    pinInit();

    // read the params... if exists... call the auto upater
    var accessToken = argv.auth;
	if (accessToken) {
		console.log('running with auto updater...');
		console.log('token: ', accessToken);

		gitHooks.setupWebHook(accessToken);
	}

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

var currentVaccum = 0;

adc.on('change', function(data) {
    console.log('ADC Channel: ' + data.channel + ' value is now ' + data.value + ' which in proportion is: ' + data.percent);

    currentVaccum = data.value;
});

function writeComplete (pinNumber, message) {
	console.log('pin:', pinNumber, '--', message);
}

function calculateTemp(value){
	var temp = value * 9 / 5 + 32;
	temp = temp.toFixed(0);

	return temp;
}

var lastOutdoorTemp,
	outdoorTemp,
	lastStackTemp,
	stackTemp,
	dirty = false;

function tempFunc () {
	console.log(Date.now(), '>> checking temp');

	sense.temperature(settings.tempSensors.stack, function(err, value) {
		stackTemp = calculateTemp(value);

		if (lastStackTemp !== stackTemp) {
			lastStackTemp = stackTemp;
			//m2x.post('stackTemp', stackTemp);	
		}
	});

	sense.temperature(settings.tempSensors.outDoor, function(err, value) {
		outdoorTemp = calculateTemp(value);

		if (lastOutdoorTemp !== outdoorTemp) {
			lastOutdoorTemp = outdoorTemp;
			//m2x.post('outdoorTemp', outdoorTemp);
		}
	});

	console.log('Stack: ', stackTemp, 'Outdoor: ', outdoorTemp);

	//Check the temp and kill the fan // this could be pulled out into a callback
	shouldFanBeRunning(outdoorTemp, relayController);
	shouldDeIcerBeRunning(outdoorTemp, relayController);

	everlive.post(stackTemp, outdoorTemp, currentVaccum);

}

function shouldFanBeRunning(temp, relay) {

	// todo ... neet to account for the pressure setting...

	var fanPin = settings.gpio.fan,
		threshold = settings.fanThreshold;

	if ( temp < threshold ) {
		relay.open(fanPin);
	} else {
		relay.closed(fanPin);
	}
}

function shouldDeIcerBeRunning(temp, relay) {
	var deIcer = settings.gpio.deIcer,
		threshold = settings.deIcerThreshold;

	if ( temp > threshold ) {
		relay.open(deIcer);
	} else {
		relay.closed(deIcer);
	}
}

/*
	relay should be setup for normally closed aka circuit ON.
	this means to turn something off... we need activate the relay which opens the circuit
*/
var relayController = {
	open: function (pin) {
		everlive.updateState('Clark Home', 'relay opened', pin);
		gpio.write(pin, true, writeComplete(pin, 'relay open'));
	},

	closed: function (pin) {
		everlive.updateState('Clark Home', 'relay closed', pin);
		gpio.write(pin, false, writeComplete(pin, 'relay closed'));
	}
}

//gracefull exit
process.on('SIGTERM', cleanAndDestroy);
process.on('SIGINT', cleanAndDestroy);

function cleanAndDestroy() {
	console.log("\nGracefully shutting down from SIGINT (Ctrl+C) or SIGTERM");

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
}
