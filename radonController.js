
//var gpio 		= require('rpi-gpio');


function something () {
	console.log('hi');
}

function radonController (callback) {

	//callb	ack();

	radonController.nested = function() {
		console.log('I was in nested function');
	};

	console.log('in controller');
}

module.exports = radonController;

/*
var radonController = function () {

	console.log ('asdfasdf');

	function goDo () {
		console.log('asdf');
	};

}

exports.rc = radonController;
*/