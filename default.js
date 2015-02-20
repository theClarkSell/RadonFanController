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

		var stackTemp = calculateTemp(value);
		console.log('Stack temperature is: ', stackTemp.green);

		if (lastStackTemp !== stackTemp) {
			lastStackTemp = stackTemp;
			postToM2x('stackTemp', stackTemp);	
		}
		
	});

	sense.temperature(settings.tempSensors.outDoor, function(err, value) {

		var outdoorTemp = calculateTemp(value);
		console.log('Current temperature is: ', outdoorTemp.green);

		if (lastOutdoorTemp !== outdoorTemp) {
			lastOutdoorTemp = outdoorTemp;
			postToM2x('outdoorTemp', outdoorTemp);	
		}
		
		//Check the temp and kill the fan // this could be pulled out into a callback
		shouldFanBeRunning(outdoorTemp, relayController);
		shouldDeIcerBeRunning(outdoorTemp, relayController);
	});

	postToEverlive(stackTemp, outdoorTemp, '21');

/*
	sense.sensors(function(err, ids) {
	});
*/

}

function postToEverlive(stackTemp, outdoorTemp, psi) {
	var post_data = {
		IndoorTemp: stackTemp,
		OutdoorTemp: outdoorTemp,
		PSI: psi,
		Device: 'test'
	}

	var post_length = JSON.stringify(post_data).length;

	var post_options = {
		host: 'api.everlive.com',
		port: '443',
		path: '/v1/XxNT7WRnd3pbqZz5/StackStatus',
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': 'XxNT7WRnd3pbqZz5',
		  'Content-Length': post_length
		}
  	};

	// Set up the request
	var post_req = https.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Everlive Response: ' + chunk);
		});
	});

	post_req.write(JSON.stringify(post_data));
	post_req.end();

}


function postToM2x(stream, temp) {

	var post_data = {
		value: temp
	};

	var post_length = JSON.stringify(post_data).length;

	var post_options = {
		host: 'api-m2x.att.com',
		port: '80',
		path: '/v2/devices/6db7bd071d27c8baccb77c544a3ceeaa/streams/' + stream + '/value',
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json',
		  'X-M2X-KEY': '82a2c1052b94a2ea4522ceabc864492d',
		  'Content-Length': post_length
		}
  	};

	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('M2X Response: ' + chunk);
		});
	});

	post_req.write(JSON.stringify(post_data));
	post_req.end();
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