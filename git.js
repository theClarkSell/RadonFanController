var http = require('http');

// http://myexternalip.com/json
function getExternalAddress(callback) {

	var	http_options = {
		host: 'myexternalip.com',
		path: '/json'
  	};

	return http.get(http_options, function(res) {
	 	var str = '';

	  	res.on('data', function (chunk) {
	    	str += chunk;
	  	});

	  	res.on('end', function () {
	    	console.log('ip payload returned ', str);
	    	var result = JSON.parse(str);

	    	callback(result.ip);
	  	});
	});
}

function setupWebHook() {

	return getExternalAddress( function(ipAddress) {
		return console.log('in callback: ', ipAddress);
	});
}

exports.setupWebHook = setupWebHook;


/*
//deployment port listening for github push events
var deployerPort   = 50000;

//Create a github webhook deployer
console.log('deployer listening on port ' + deployerPort);

var depServer = http.createServer(deployer({
    path:'/webhook',
    secret : 'testSecret'
})).listen(deployerPort);
*/