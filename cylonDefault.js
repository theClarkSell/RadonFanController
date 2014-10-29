Cylon = require('cylon');

Cylon.robot({
  connection: { name: 'raspi', adaptor: 'raspi' },
  device: { name: 'led', driver: 'led', pin: 17 },
  work: function(my) {
    every((1).second(), function() {
      my.led.toggle();
    });
  }
}).start();
