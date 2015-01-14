# rpi [![Build Status](https://travis-ci.org/xseignard/rpi.png?branch=master)](https://travis-ci.org/xseignard/rpi)

Yet another Node.js library to use the Raspberry Pi GPIOs.

Relies on [WiringPi](http://wiringpi.com/) and then has some nice features:
- no sudo required
- you can use the GPIOs from the P5 header of the Pi
- based on [Event Emitters](http://nodejs.org/api/events.html)

It's a WIP! But basic read and write should work. See the `examples` folder.

## API

  - [GPIO()](#gpio)
  - [GPIO.write())](#gpiowritevaluenumbercallbackfunction)
  - [GPIO.high())](#gpiohighcallbackfunction)
  - [GPIO.low())](#gpiolowcallbackfunction)
  - [GPIO.read())](#gpioreadcallbackfunction)

## GPIO()

  GPIO class, that represents an instance of a GPIO.
  
  Pin numbers are the ones used in wiringPi. Specify the pin direction with 'in' or 'out'.
  
  If the pin direction is 'in', events 'change', 'rise' and 'fall' will be fired when needed.
  
  Here is a quick sample: 
  
  ```js
  var pin8 = new GPIO(8, 'in');
  pin8.on('ready', function() {
   console.log('ready');
  });
  pin8.on('rise', function() {
   console.log('rise');
  });
  pin8.on('change', function(value) {
   console.log(value);
  });
  ```

## GPIO.write(value:Number, callback:function())

  Write the value on the GPIO

## GPIO.high(callback:function())

  Shorthand for pin.write(1, callback). Writes 1 on the GPIO

## GPIO.low(callback:function())

  Shorthand for pin.write(0, callback). Writes 0 on the GPIO

## GPIO.read(callback:function())

  Reads the value on the GPIO
