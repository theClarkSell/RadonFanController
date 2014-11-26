var Cylon = require('cylon');
var sense = require('ds18b20');

Cylon.robot({
  connection: { name: 'raspi', adaptor: 'raspi' },
  device: { name: 'led', driver: 'led', pin: 11 },
  work: function(my) {
    return every(1..second(), function() {
		sense.sensors(function(err, ids) {
	  		sense.temperature(ids, function(err, value) {
	  			var temp = value * 9 / 5 + 32;

		  		console.log('Current temperature is', temp);
			});
		});

  		return my.led.toggle();
    });
  }
}).start();
