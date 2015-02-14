//
// Sample datasource implementation that retrieves the load average
//
// This "class" knows nothing about M2X, and, although not changes are required
// in this file to be able to run the examples, it might not work depending on
// the platform.
//

var exec = require("child_process").exec;

function UptimeDataSource() {
    // Match `uptime` load averages output for both Linux and OSX
    this.UPTIME_RE = new RegExp("(\\d+\\.\\d+),? (\\d+\\.\\d+),? (\\d+\\.\\d+)$", "m");
};

// Retrieve the current load values
//
// use:
//    source.update(function(data) {
//        console.log(data);
//    });
UptimeDataSource.prototype.update = function(cb) {
    var self = this;

    exec("uptime", function(error, stdout, stderr) {
        var match = stdout.match(self.UPTIME_RE);

        if (match) {
            cb({ load_1m: match[1], load_5m: match[2], load_15m: match[3] });
        }
    });
};

// Retrieve values every +interval+ ms
//
// use:
//    source.updateEvery(1000, function(data, stopLoop) {
//        console.log(data);
//
//        // ...
//
//        if (errorsFound) {
//            stopLoop();
//        }
//    });
//
// notes:
//    Beware that if you call +stopLoop+ after an +interval+ period, a new
//    call should have already been made. This is just an example, you might
//    want to implement your own solution.

UptimeDataSource.prototype.updateEvery = function(interval, cb) {
    var self = this;
    var handle;
    var handler;

    handler = function(data) {
        self.update(function(data) {
            cb(data, function() {
                clearInterval(handle);
            });
        });
    };

    handle = setInterval(handler, interval);
};

module.exports = UptimeDataSource;
