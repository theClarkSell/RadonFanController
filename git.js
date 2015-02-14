var http 		= require('http');
var https 		= require('https');
var deployer 	= require('github-webhook-deployer');

// http://myexternalip.com/json
function getExternalAddress(callback) {

	var	http_options = {
		host: 'myexternalip.com',
		path: '/json'
  	};

	var request = http.request(http_options, function(res) {
	 	var str = '';

	  	res.on('data', function (chunk) {
	    	str += chunk;
	  	});

	  	res.on('end', function () {
	    	var result = JSON.parse(str);
	    	callback(result.ip);
	  	});
	});

 	request.on('error', function(err) {
        console.log('error', err);
    });

	request.end();
}

exports.setupWebHook = function (accessToken) {

	getExternalAddress( function(ipAddress) {
		createWebHook(ipAddress, accessToken);
		createGitListener();
	});
}

//this assumes you already have one setup and you're just updating the address
function createWebHook(ipAddress, accessToken) {

	var post_data = {
		"name": "web",
		"active": true,
		"events": [
			"push"
		],
		"config": {
			"url": "http://" + ipAddress + ":50000/webhook",
			"content_type": "json"
		}
	};

	var post_length = JSON.stringify(post_data).length;

	var post_options = {
		host: 'api.github.com',
		path: '/repos/csell5/RadonFanController/hooks',
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'Content-Length': post_length,
		  'User-Agent': 'RPI-AutoUpdater',
		  'Authorization': 'token ' + accessToken
		}
  	};

	// Set up the request
	var post_req = https.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('GitHub Response: ' + chunk);
		});
	});

	post_req.write(JSON.stringify(post_data));
	post_req.end();
}

function createGitListener() {
	
	var deployerPort = 50000;

	//Create a github webhook deployer
	console.log('deployer listening on port ' + deployerPort);

	var depServer = http.createServer(deployer({
		path:'/webhook',
		secret : 'testSecret'
	})).listen(deployerPort);
}
