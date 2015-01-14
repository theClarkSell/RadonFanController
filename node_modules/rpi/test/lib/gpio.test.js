'use strict';
var chai = require('chai'),
	expect = chai.expect,
	GPIO = require('../../src/lib/gpio'),
	proc = require('child_process'),
	sinon = require('sinon'),
	gpio, exec;

describe('GPIO', function() {
	beforeEach(function(){
		exec = sinon.stub(proc, 'exec');
	});

	afterEach(function(){
		exec.restore();
	});

	it('Should be correctly instanciated', function() {
		var readyEventSpy = sinon.spy();
		gpio = new GPIO(8, 'out');
		gpio.on('ready', readyEventSpy);
		// assert params are ok
		expect(gpio.pinNumber).to.equal(8);
		expect(gpio.direction).to.equal('out');
		// assert the ready callback is ok
		sinon.assert.calledWith(proc.exec, 'gpio mode 8 out');
		sinon.assert.notCalled(readyEventSpy);
		proc.exec.invokeCallback();
		sinon.assert.calledOnce(readyEventSpy);
	});

	it('#write() : Should perform a write', function() {
		var writeSpy = sinon.spy();
		gpio = new GPIO(8, 'out');
		gpio.on('ready', function() {
			gpio.write(1, writeSpy);
		});
		// invoke proc.exec callback from the constructor
		proc.exec.invokeCallback();
		// then on ready event check proc.exec params
		sinon.assert.calledWith(proc.exec, 'gpio write 8 1');
		sinon.assert.notCalled(writeSpy);
		// and assert the gpio.write callback is actually called
		proc.exec.invokeCallback();
		sinon.assert.calledOnce(writeSpy);
	});

	it('#write() : Should throw an error when pin direction is not out', function() {
		gpio = new GPIO(8, 'in');
		gpio.on('ready', function() {
			var fn = function() {
				gpio.write(1);
			};
			expect(fn).to.throw(Error, 'The pin is not configured in "out" mode');
		});
		// invoke proc.exec callback from the constructor
		proc.exec.invokeCallback();
	});

	it('#high() : Should perform a write with a value of 1', function() {
		gpio = new GPIO(8, 'out');
		gpio.on('ready', function() {
			gpio.high();
		});
		// invoke proc.exec callback from the constructor
		proc.exec.invokeCallback();
		// then on ready event check proc.exec params for the gpio.high
		sinon.assert.calledWith(proc.exec, 'gpio write 8 1');
		// invoke the gpio.high callback
		proc.exec.invokeCallback();
	});

	it('#low() : Should perform a write with a value of 0', function() {
		gpio = new GPIO(8, 'out');
		gpio.on('ready', function() {
			gpio.low();
		});
		// invoke proc.exec callback from the constructor
		proc.exec.invokeCallback();
		// then on ready event check proc.exec params for the gpio.low
		sinon.assert.calledWith(proc.exec, 'gpio write 8 0');
		// invoke the gpio.low callback
		proc.exec.invokeCallback();
	});

	it('#read() : Should perform a read', function() {
		var expectedValue = 1;
		gpio = new GPIO(8, 'out');
		gpio.on('ready', function() {
			gpio.write(1, function() {
				gpio.read();
			});
		});
		// invoke proc.exec callback from the constructor
		proc.exec.invokeCallback();
		// invoke the gpio.write callback
		proc.exec.invokeCallback();
		// then on gpio.read check proc.exec params
		sinon.assert.calledWith(proc.exec, 'gpio read 8');
	});
});