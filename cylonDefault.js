var Cylon = require('cylon');
var sense = require('ds18b20');

Cylon.robot({
  connection: { name: 'raspi', adaptor: 'raspi' },
  devices: { 
  	led: { driver: 'led', pin: 11 },
  	relay: { driver: 'led', pin: 16 }
  },

  work: function(my) {
    return every(1..second(), function() {
		sense.sensors(function(err, ids) {
	  		sense.temperature(ids, function(err, value) {
	  			var temp = value * 9 / 5 + 32;

		  		console.log('Current temperature is', temp);
			});
		});

		my.relay.toggle();

  		return my.led.toggle();
    });
  }
}).start();
