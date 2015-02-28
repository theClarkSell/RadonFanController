var ADC = require('adc-pi-gpio'),
    config = {
        tolerance : 2,
        interval : 300,
        channels : [ 0 ],
        //SPICLK: 12, 23,
        //SPIMISO: 16, 21,
        //SPIMOSI: 18, 19,
        //SPICS: 22, 24
        //Need to take from settings....
        SPICLK: 23,
        SPIMISO: 21,
        SPIMOSI: 19,
        SPICS: 24
    };
 
var adc = new ADC(config);
adc.init();
 
adc.on('ready', function() {
    console.log('Pins ready, listening to channel');
});

adc.on('change', function(data) {
    console.log('Channel ' + data.channel + ' value is now ' + data.value + ' which in proportion is: ' + data.percent);
});

//clean up.
adc.on('close', function() {
    console.log('ADC terminated');
    process.exit();
});

process.on('SIGTERM', function(){
    adc.close();
});

process.on('SIGINT', function(){
    adc.close();
});

module.exports = adc;