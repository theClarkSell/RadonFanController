#!/usr/bin/env node

//
// This is a simple application that requests the list
// of available devices for the provided API Key and then
// prints the details for each of those devices
//

var config = require("./config");
var M2X = require("m2x");
var m2xClient = new M2X(config.api_key);

m2xClient.devices.list(function(response) {
    if (response.isSuccess()) {
        response.json.devices.forEach(function(device) {
            console.log(device);
        });
    } else {
        console.log(response.error());
    }
});
