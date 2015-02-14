#!/usr/bin/env node

//
// This is a simple application that requests the current
// M2X service status and prints it to the console
//

var config = require("./config");
var M2X = require("m2x");
var m2xClient = new M2X(config.api_key);

m2xClient.status(function(data) {
    console.log("Current status of M2X service: ");
    console.log("    API:      " + data.json.api);
    console.log("    TRIGGERS: " + data.json.triggers);
});
