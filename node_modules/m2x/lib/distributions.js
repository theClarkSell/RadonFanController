"use strict";

var helpers = require("./helpers");
var Distributions;

// Wrapper for AT&T M2X Distribution API
//
// https://m2x.att.com/developer/documentation/distribution
Distributions = function(client) {
    this.client = client;
};

// Retrieve a list of device distributions
//
// https://m2x.att.com/developer/documentation/v2/distribution#List-Distributions
Distributions.prototype.list = function(params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    return this.client.get("/distributions", { qs: params || {} }, callback);
};

// Create a new device distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Create-Distribution
Distributions.prototype.create = function(params, callback) {
    return this.client.post("/distributions", { params: params }, callback);
};

// Retrieve information about an existing device distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#View-Distribution-Details
Distributions.prototype.view = function(id, callback) {
    return this.client.get(helpers.url("/distributions/%s", id), callback);
};

// Update an existing device distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Update-Distribution-Details
Distributions.prototype.update = function(id, params, callback) {
    return this.client.put(
        helpers.url("/distributions/%s", id),
        { params: params },
        callback
    );
};

// Retrieve a list of devices added to the a device distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#List-Devices-from-an-existing-Distribution
Distributions.prototype.devices = function(id, callback) {
    return this.client.get(
        helpers.url("/distributions/%s/devices", id),
        callback
    );
};

// Add a new device to an existing device distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Add-Device-to-an-existing-Distribution
Distributions.prototype.addDevice = function(id, serial, callback) {
    return this.client.post(helpers.url("/distributions/%s/devices", id), {
        headers: { "Content-Type": "application/json" },
        params: { serial: serial }
    }, callback);
};

// Delete an existing device distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Delete-Distribution
Distributions.prototype.deleteDistribution = function(id, callback) {
    return this.client.del(helpers.url("/distributions/%s", id), callback);
};

// Retrieve a list of data streams associated with the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#List-Data-Streams
Distributions.prototype.dataStreams = function(id, callback) {
    return this.client.get(
        helpers.url("/distributions/%s/streams", id),
        callback
    );
};

// Create/Update a data stream associated with the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Create-Update-Data-Stream
Distributions.prototype.updateDataStream = function(id, name, params, callback) {
    return this.client.put(
        helpers.url("/distributions/%s/streams/%s", id, name),
        {
            headers: { "Content-Type": "application/json" },
            params: params
        },
        callback
    );
};

// View information about a stream associated to the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#View-Data-Stream
Distributions.prototype.dataStream = function(id, name, callback) {
    return this.client.get(
        helpers.url("/distributions/%s/streams/%s", id, name),
        callback
    );
};

// Delete an existing data stream associated to distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Delete-Data-Stream
Distributions.prototype.deleteDataStream = function(id, name, callback) {
    return this.client.del(
        helpers.url("/distributions/%s/streams/%s", id, name),
        callback
    );
};

// Retrieve list of triggers associated with the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#List-Triggers
Distributions.prototype.triggers = function(id, callback) {
    return this.client.get(
        helpers.url("/distributions/%s/triggers", id),
        callback
    );
};

// Create a new trigger associated with the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Create-Trigger
Distributions.prototype.createTrigger = function(id, params, callback) {
    return this.client.post(
        helpers.url("/distributions/%s/triggers", id),
        { params: params },
        callback
    );
};

// Retrieve information about a trigger associated to a distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#View-Trigger
Distributions.prototype.trigger = function(id, triggerId, callback) {
    return this.client.get(
        helpers.url("/distributions/%s/triggers/%s", id, triggerId),
        callback
    );
};

// Update an existing trigger associated with the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Update-Trigger
Distributions.prototype.updateTrigger = function(id, triggerId, params, callback) {
    return this.client.put(
        helpers.url("/distributions/%s/triggers/%s", id, triggerId),
        { params: params },
        callback
    );
};

// Test a trigger by firing a fake value
//
// https://m2x.att.com/developer/documentation/v2/distribution#Test-Trigger
Distributions.prototype.testTrigger = function(id, triggerId, callback) {
    return this.client.post(
        helpers.url("/distributions/%s/triggers/%s/test", id, triggerId),
        callback
    );
};

// Delete a trigger associated to the distribution
//
// https://m2x.att.com/developer/documentation/v2/distribution#Delete-Trigger
Distributions.prototype.deleteTrigger = function(id, triggerId, callback) {
    return this.client.del(
        helpers.url("/distributions/%s/triggers/%s", id, triggerId),
        callback
    );
};

module.exports = Distributions;
