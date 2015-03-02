var https				= require('https');

/* will need this later.

function authenticate() {
	var user = {
    	"username": "apiAccess",
    	"password": "password",
    	"grant_type": "password"
	};

	var post_length = JSON.stringify(post_data).length;

	var post_options = {
		host: 'api.everlive.com',
		port: '443',
		path: 'v1/XxNT7WRnd3pbqZz5/oauth/token',
		method: 'POST',
		headers: {
		  'Content-Type': 'application/json',
		  'Content-Length': post_length
		}
  	};

	// Set up the request
	var post_req = https.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('Everlive Auth Response: ' + chunk);
		});
	});

	post_req.write(JSON.stringify(post_data));
	post_req.end();
}
*/

var everlive = {

	updateState: function(device, state, pin) {
		var post_data = {
			Device: device,
			State: state,
			GPIO: pin
		}

		postToEverlive(post_data, 'ActionTaken');
	},

	postToEverlive: function (postData, action) {	
		var postBody = JSON.stringify(postData);
		var post_length = postBody.length;

		var post_options = {
			host: 'api.everlive.com',
			port: '443',
			path: '/v1/XxNT7WRnd3pbqZz5/' + action,
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'Content-Length': post_length
			}
	  	};

		// Set up the request
		var post_req = https.request(post_options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('Everlive Response: ' + chunk);
			});
		});

		post_req.write(postBody);
		post_req.end();

	},

	post: function(stackTemp, outdoorTemp, psi) {
		var post_data = {
			IndoorTemp: stackTemp,
			OutdoorTemp: outdoorTemp,
			PSI: psi,
			Device: 'test'
		}

		var post_length = JSON.stringify(post_data).length;

		var post_options = {
			host: 'api.everlive.com',
			port: '443',
			path: '/v1/XxNT7WRnd3pbqZz5/StackStatus',
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'Content-Length': post_length
			}
	  	};

		// Set up the request
		var post_req = https.request(post_options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				console.log('Everlive Response: ' + chunk);
			});
		});

		post_req.write(JSON.stringify(post_data));
		post_req.end();
	}
}

module.exports = everlive;