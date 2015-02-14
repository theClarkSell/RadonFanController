"use strict";

var util = require("util");
var extend;
var url;

extend = function(target) {
    var sources = [].slice.call(arguments, 1);
    sources.forEach(function(source) {
        var prop;
        for (prop in source) {
            target[prop] = source[prop];
        }
    });
    return target;
};

url = function(format) {
    var params = Array.prototype.slice.call(arguments, 1).map(function(param) {
        return encodeURIComponent(param);
    });

    return util.format.apply(this, [format].concat(params));
};

module.exports = {
    extend: extend,
    url: url
};
