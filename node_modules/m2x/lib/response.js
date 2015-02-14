"use strict";

var Response = function(error, res) {
    this.raw = res.body;
    this.headers = res.headers;
    this.status = res.statusCode;

    if (error) {
        this._error = { error: res.body };
    } else {
        if (res.headers["content-type"] === "application/json") {
            try {
                this.json = res.body ? JSON.parse(res.body) : {};
            } catch (ex) {
                this._error = { error: ex.toString() };
            }
        }
    }
};

Response.prototype.error = function() {
    if (!this._error && this.isError()) {
        this._error = this.json || {};
    }
    return this._error;
};

Response.prototype.isError = function() {
    return (this._error || this.isClientError() || this.isServerError());
};

Response.prototype.isSuccess = function() {
    return !this.isError();
};

Response.prototype.isClientError = function() {
    return this.status >= 400 && this.status < 500;
};

Response.prototype.isServerError = function() {
    return this.status >= 500;
};

module.exports = Response;
