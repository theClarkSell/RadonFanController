/*
 * (C) 2014 Seth Lakowske
 */

var Push   = require('github-push-event');
var fs     = require('fs');
var bl     = require('bl');
var crypto = require('crypto');

console.log('Usage: node push.js localhost');

var port = 3334;
var server = process.argv[2];
var path = '/webhook';

function signBlob (key, blob) {
  return 'sha1=' +
  crypto.createHmac('sha1', key).update(blob).digest('hex')
}

//read in event template
var dataSign = 'faked';
var event    = 'faked';

var event = fs.readFileSync('pushEvent.txt');

var b = bl(function(err, data) {
    dataSig  = signBlob('testSecret', data);
    event    = data;

    var url = 'http://'+server+':'+port+path;
    console.log(url);
    //describe the webhook push event
    var push = new Push({
        url       : url,
        delivery  : 'b476ef00-8d9e-11e4-9962-1c7fc692548e',
        signature : dataSig,
        string    : event,
        hostname  : server,
        port      : port,
        path      : path,
    })

    //send the push event
    push.push(function(response) {
        console.log('responseString: ' + response);
    });
})

b.write(event);
b.end();
