var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	proc = require('child_process'),
	gpio = 'gpio';

var gpioEventNames = {
	ready : 'ready',
	change : 'change',
	rise : 'rise',
	fall : 'fall'
};
/**
 * GPIO class, that represents an instance of a GPIO.
 *
 * Pin numbers are the ones used in wiringPi. Specify the pin direction with 'in' or 'out'.
 *
 * If the pin direction is 'in', events 'change', 'rise' and 'fall' will be fired when needed.
 *
 * Here is a quick sample: 
 * 
 * ```js
 * var pin8 = new GPIO(8, 'in');
 * pin8.on('ready', function() {
 *  console.log('ready');
 * });
 * pin8.on('rise', function() {
 *  console.log('rise');
 * });
 * pin8.on('change', function(value) {
 *  console.log(value);
 * });
 * ```
 *
 * @constructor
 * @property {Number} pinNumber - GPIO pin number according to wiringPi
 * @property {String} direction - 'in' or 'out'
 * @fires 'ready' event when GPIO is configured
 * @fires 'change' event when the value of the pin changes (only for 'in' pins)
 * @fires 'rise' event when the value of the pin rises (only for 'in' pins)
 * @fires 'fall' event when the value of the pin falls (only for 'in' pins)
 * @throws {Error} - an Error if the configuration went wrong
 */
var GPIO = function(pinNumber, direction) {
	var _self = this;
	_self.pinNumber = pinNumber;
	_self.direction = direction;
	currentValue = -1;

	proc.exec([gpio, 'mode', pinNumber, direction].join(' '), function(error, stdout, stderr) {
		if (error) throw new Error(stderr);
		_self.emit(gpioEventNames.ready);
		if (_self.direction === 'in') {
			setInterval(function() {
				_self.read(function(value) {
					if (currentValue !== value) {
						currentValue = value;
						_self.emit(gpioEventNames.change, currentValue);
						if (parseInt(currentValue,10)) {
							_self.emit(gpioEventNames.rise);
						}
						else {
							_self.emit(gpioEventNames.fall);
						}
					}
				});
			}, 100);
		}
	});
};
util.inherits(GPIO, EventEmitter);

/**
 * Write the value on the GPIO
 * @param {Number} value - the value to write, either 1 or 0
 * @param {function()} callback - to be called when the wirte is done
 * @throws {Error} - an Error if the write went wrong
 */
GPIO.prototype.write = function(value, callback) {
	if (this.direction !== 'out') throw new Error('The pin is not configured in "out" mode');
	proc.exec([gpio, 'write', this.pinNumber, value].join(' '), function(error, stdout, stderr) {
		if (error) throw new Error(stderr);
		if (typeof callback === 'function') callback();
	});
};

/**
 * Shorthand for pin.write(1, callback). Writes 1 on the GPIO
 * @param {function()} callback - to be called when the wirte is done
 */
GPIO.prototype.high = function(callback) {
	this.write(1, callback);
};

/**
 * Shorthand for pin.write(0, callback). Writes 0 on the GPIO
 * @param {function()} callback - to be called when the wirte is done
 */
GPIO.prototype.low = function(callback) {
	this.write(0, callback);
};

/**
 * Reads the value on the GPIO
 * @param {function()} callback - to be called when the write is done, first arg is the read value
 * @throws {Error} - an Error if the read went wrong
 */
GPIO.prototype.read = function(callback) {
	proc.exec([gpio, 'read', this.pinNumber].join(' '), function(error, stdout, stderr) {
		if (error) throw new Error(stderr);
		if (typeof callback === 'function' && typeof stdout === 'string') callback(stdout.trim());
	});
};

module.exports = GPIO;




