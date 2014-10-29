Cylon = require('cylon');

Cylon.robot({
  connection: { name: 'raspi', adaptor: 'raspi' },
  device: { name: 'led', driver: 'led', pin: 11 },
  work: function(my) {
    return every(1..second(), function() {
      return my.led.toggle();
    });
  }
}).start();
