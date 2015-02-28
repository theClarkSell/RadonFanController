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
var gitHooks			= require('./git');
var adc					= require('./adc');
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
    console.log('TEST::: Channel ' + data.channel + ' value is now ' + data.value + ' which in proportion is: ' + data.percent);
    
    currentVaccum = data.percent;

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
	stackTemp;

function tempFunc () {
	console.log(Date.now(), '>> checking temp');

	sense.temperature(settings.tempSensors.stack, function(err, value) {

		stackTemp = calculateTemp(value);
		console.log('Stack temperature is: ', stackTemp.green);

		if (lastStackTemp !== stackTemp) {
			lastStackTemp = stackTemp;
			m2x.post('stackTemp', stackTemp);	
		}
		
	});

	sense.temperature(settings.tempSensors.outDoor, function(err, value) {

		outdoorTemp = calculateTemp(value);
		console.log('Current temperature is: ', outdoorTemp.green);

		if (lastOutdoorTemp !== outdoorTemp) {
			lastOutdoorTemp = outdoorTemp;
			m2x.post('outdoorTemp', outdoorTemp);	
		}
		
		//Check the temp and kill the fan // this could be pulled out into a callback
		shouldFanBeRunning(outdoorTemp, relayController);
		shouldDeIcerBeRunning(outdoorTemp, relayController);
	});

	everlive.post(stackTemp, outdoorTemp, currentVaccum);
}

function shouldFanBeRunning(temp, relay) {

	// todo ... neet to account for the pressure setting...

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