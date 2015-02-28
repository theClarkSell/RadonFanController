var http				= require('http');

var post = function (stream, temp) {

	var post_data = {
		value: temp
	};

	var post_length = JSON.stringify(post_data).length;

	var post_options = {
		host: 'api-m2x.att.com',
		port: '80',
		path: '/v2/devices/6db7bd071d27c8baccb77c544a3ceeaa/streams/' + stream + '/value',
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json',
		  'X-M2X-KEY': '82a2c1052b94a2ea4522ceabc864492d',
		  'Content-Length': post_length
		}
  	};

	// Set up the request
	var post_req = http.request(post_options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			console.log('M2X Response: ' + chunk);
		});
	});

	post_req.write(JSON.stringify(post_data));
	post_req.end();
}

module.exports = post;