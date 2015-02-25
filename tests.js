var ADC = require('adc-pi-gpio'),
    config = {
        tolerance : 2,
        interval : 300,
        channels : [ 0, 1, 2 ],
        //SPICLK: 12, 23,
        //SPIMISO: 16, 21,
        //SPIMOSI: 18, 19,
        //SPICS: 22, 24
        SPICLK: 23,
        SPIMISO: 21,
        SPIMOSI: 19,
        SPICS: 24
    };
 
var adc = new ADC(config);
 
process.on('SIGTERM', function(){
    adc.close();
});

process.on('SIGINT', function(){
    adc.close();
});
 
adc.init();
 
adc.on('ready', function() {
    console.log('Pins ready, listening to channel');
});

adc.on('close', function() {
    console.log('ADC terminated');
    process.exit();
});

adc.on('change', function(data) {

    //Pressure((((adc+0.3)/255)-0.04)/0.009)
    //console.log("caculated", ((((data.value + 0.3) / 255) - 0.04) / 0.009) );
    console.log('Channel ' + data.channel + ' value is now ' + data.value + ' which in proportion is: ' + data.percent);
});