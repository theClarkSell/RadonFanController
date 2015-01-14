var GPIO = require('../src/rpi').GPIO;

var pin8 = new GPIO(8, 'in');

console.log(pin8);

pin8.on('ready', function() {
	console.log('ready');
});

pin8.on('rise', function() {
	console.log('rise');
});
pin8.on('change', function(value) {
	console.log(value);
});
