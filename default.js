var async       		= require('async');
var express 			= require('express');
var sense 				= require('ds18b20');
var gpio 				= require('rpi-gpio');
var http				= require('http');

//3rd party services
var m2x 				= require('m2x');

//our modules
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

function tempFunc () {
	console.log(Date.now(), '>> checking temp');

	sense.sensors(function(err, ids) {
		sense.temperature(ids, function(err, value) {
			var temp = value * 9 / 5 + 32;
			console.log('Current temperature is: ', temp);

			//log temp to m2x
			postToM2x(temp);

			//Check the temp and kill the fan // this could be pulled out into a callback
			shouldFanBeRunning(temp, relayController);
			shouldDeIcerBeRunning(temp, relayController);
		});
	});
}

function postToM2x(temp) {
	//http://api-m2x.att.com/v2/devices/e5e13be8507752e3487f62ab97da6965/streams/temperature/values" -d '[{"value": 30, "timestamp": "2014-07-16T02:55:12.345Z"}]' -H "Content-Type: application/json" -H "X-M2X-KEY: <API_KEY>

	var post_data = {
		"value": 10
	};

	var post_options = {
			host: 'api-m2x.att.com',
			port: '80',
			path: '/v2/devices/6db7bd071d27c8baccb77c544a3ceeaa/streams/temp/value',
			method: 'PUT',
			headers: {
			  'Content-Type': 'application/json',
			  'X-M2X-KEY': '82a2c1052b94a2ea4522ceabc864492d',
			  'Content-Length': post_data.length
			}
  	};

	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Response: ' + chunk);
		});
	});

	// post
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