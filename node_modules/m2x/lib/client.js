"use strict";

var request = require("request");
var querystring = require("querystring");
var helpers = require("./helpers");
var Response = require("./response");
var API_BASE = "https://api-m2x.att.com/v2";
// reference: https://code.google.com/p/v8/
var USER_AGENT = "M2X-Nodejs/2.1.7 ECMAScript/5.1 (" + process.arch + "-" + process.platform + ")";
var Client;
var createVerb;

createVerb = function(object, verb, methodName) {
    object[methodName] = function(path, options, callback) {
        return object.request(verb, path, options, callback);
    };
};

Client = function(apiKey, apiBase) {
    var self = this;
    var verbs;

    this.apiKey = apiKey;
    this.apiBase = apiBase || API_BASE;

    this.defaultHeaders = {
        "User-Agent": USER_AGENT,
        "X-M2X-KEY": this.apiKey
    };

    verbs = ["get", "post", "put", "head", "options", "patch"];

    verbs.forEach(function(verb) {
        createVerb(self, verb, verb);
    });
    createVerb(this, "delete", "del");
};

Client.prototype.request = function(verb, path, options, callback) {
    var body;
    var headers;

    if (typeof options === "function") {
        // callback was sent in place of options
        callback = options;
        options = {};
    }

    headers = helpers.extend(options.headers || {}, this.defaultHeaders);

    if (! headers["Content-Type"]) {
        if (verb.toLowerCase() === "get") {
            headers["Content-Type"] = "application/x-www-form-urlencoded";
        } else {
            headers["Content-Type"] = "application/json";
        }
    }

    if (options.params) {
        switch (headers["Content-Type"]) {
        case "application/json":
            body = JSON.stringify(options.params);
            break;
        case "application/x-www-form-urlencoded":
            body = querystring.stringify(options.params);
            break;
        default:
            throw "Unrecognized Content-Type `" + headers["Content-Type"] + "`";
        }
    }

    request({
        url: this.apiBase + path,
        qs: options.qs,
        method: verb,
        headers: headers,
        body: body
    }, function(error, response, body) {
        if (callback) {
            callback.call(this, new Response(error, response));
        }
    });
};

module.exports = Client;
