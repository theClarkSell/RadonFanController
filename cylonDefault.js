var Cylon = require('cylon');
var sense = require('ds18b20');

Cylon.robot({
  connection: { name: 'raspi', adaptor: 'raspi' },
  device: { name: 'led', driver: 'led', pin: 11 },
  work: function(my) {
    return every(1..second(), function() {
		sense.sensors(function(err, ids) {
		  console.log('sensor id', ids); // got sensor IDs ...
		});

		// ...
		sense.temperature('28-00000652eb08', function(err, value) {
		  console.log('Current temperature is', value);
		});

  		return my.led.toggle();
    });
  }
}).start();
