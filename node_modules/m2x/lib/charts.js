"use strict";

var helpers = require("./helpers");
var Charts;

// Wrapper for AT&T M2X Charts API
//
// https://m2x.att.com/developer/documentation/charts
Charts = function(client) {
    this.client = client;
};

// Retrieve a list of charts that belongs to the user
//
// https://m2x.att.com/developer/documentation/v2/charts#List-Charts
Charts.prototype.list = function(callback) {
    return this.client.get("/charts", callback);
};

// Create a new chart
//
// https://m2x.att.com/developer/documentation/v2/charts#Create-Chart
Charts.prototype.create = function(params, callback) {
    return this.client.post("/charts", { params: params }, callback);
};

// Get details of a chart
//
// https://m2x.att.com/developer/documentation/v2/charts#View-Chart-Details
Charts.prototype.view = function(id, callback) {
    return this.client.get(helpers.url("/charts/%s", id), callback);
};

// Update an existing chart
//
// https://m2x.att.com/developer/documentation/v2/charts#Update-Chart
Charts.prototype.update = function(id, params, callback) {
    return this.client.put(
        helpers.url("/charts/%s", id),
        { params: params },
        callback
    );
};

// Delete an existing chart
//
// https://m2x.att.com/developer/documentation/v2/charts#Delete-Chart
Charts.prototype.deleteChart = function(id, callback) {
    return this.client.del(helpers.url("/charts/%s", id), callback);
};

// Render a chart into a png or svg image
//
// https://m2x.att.com/developer/documentation/v2/charts#Render-Chart
Charts.prototype.render = function(id, format, params, callback) {
    if (typeof params === "function") {
        callback = params;
        params = {};
    }
    return this.client.get(
        helpers.url("/charts/%s.%s", id, format),
        { qs: params || {} },
        callback
    );
};

module.exports = Charts;
