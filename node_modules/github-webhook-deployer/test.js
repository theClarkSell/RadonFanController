/*
 * (C) Seth Lakowske
 */

var deployer  = require('./');
var test      = require('tape');
var Push      = require('github-push-event').Push;
var PushEvent = require('github-push-event').PushEvent;
var fs        = require('fs');
var crypto    = require('crypto');
var bl        = require('bl');
var http      = require('http');
var git       = require('git-rev');

function signBlob (key, blob) {
  return 'sha1=' +
  crypto.createHmac('sha1', key).update(blob).digest('hex')
}

test('can receive push events', function(t) {

    var dataSign = 'faked';
    var event    = 'faked';

    //build a push event
    var pushEvent = new PushEvent();
    var event = pushEvent.get({
        'ref'   :'refs/heads/master',
        'before':'171c2ede2a4ccc4f108bb19438fce8729031336d',
        'after' :'171c2ede2a4ccc4f108bb19438fce8729031336e',
        'commit':'171c2ede2a4ccc4f108bb19438fce8729031336e',
        'username'  :'someUser',
        'repository':'someRepo',
        'email'     :'some@email.com'
    });

    var b     = bl(function(err, data) {
        dataSig   = signBlob('testSecret', data);
        event = data;
    })

    b.write(event);

    b.end();

    var port = 3334;

    var path = '/webhook';

    var server = http.createServer(deployer({ path : path, secret : 'testSecret' })).listen(port);

    //describe the webhook push event
    var push = new Push({
        url       : 'http://localhost:'+port+path,
        delivery  : 'b476ef00-8d9e-11e4-9962-1c7fc692548e',
        signature : dataSig,
        string    : event,
        hostname  : 'localhost',
        port      : port,
        path      : path,
    })

    //send the push event
    push.push(function() {
        server.close();
        t.end();
    });
})

test('can send current version', function(t) {
    var port = 3334;
    var path = '/webhook';

    var server = http.createServer(deployer({ path : path, secret : 'testSecret' })).listen(port);

    var req = http.request({
        hostname : 'localhost',
        port     : port,
        path     : '/version',
        method   : 'GET',
    }, function(res) {

        console.log('STATUS: '  + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        res.setEncoding('utf8');
        var responseString = '';

        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
            responseString += chunk.toString();
        })

        res.on('end', function() {
            git.long(function(version) {
                t.strictEqual(responseString, version, 'versions should match');
                server.close();
                t.end();
            })
        })

        res.on('error', function(error) {
            console.log('got an error');
            console.log(error);
        })

    });

    req.end();
})
