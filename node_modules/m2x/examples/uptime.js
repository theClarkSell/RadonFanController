#!/usr/bin/env node

//
// See https://github.com/attm2x/m2x-nodejs/blob/master/README.md#example-usage
// for instructions
//

var config = require("./config");
var M2X = require("m2x");
var UptimeDataSource = require("./uptime_data_source");
var source = new UptimeDataSource();
var m2xClient = new M2X(config.api_key);

source.update(function(data) {
    var streams = ["load_1m", "load_5m", "load_15m"];

    // Create the streams if they don't exist already
    m2xClient.devices.updateStreams(config.device, streams, function(response) {
        if (response.isError()) {
            console.log("Cannot create stream:", response);
            return;
        }

        // Retrieve values each 1100ms and post them to the device
        source.updateEvery(1100, function(data, stopLoop) {
            var at = new Date().toISOString();
            var values = {
                load_1m:  [ { value: data.load_1m, timestamp: at } ],
                load_5m:  [ { value: data.load_5m, timestamp: at } ],
                load_15m: [ { value: data.load_15m, timestamp: at } ]
            };

            // Write the different values into AT&T M2X
            m2xClient.devices.postMultiple(config.device, values, function(result) {
                console.log(result);
                if (result.isError()) {
                    // Stop the update loop if an error occurs.
                    stopLoop();

                    console.log(result.error());
                }
            });
        });
    });
});

