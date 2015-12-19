var _fs 		= require('fs');
var _extend = require('extend');

var baseSettings = {
	"fanThreshold": "20",
	"deIcerThreshold": "32",
	"checkInterval": "5000",
	"pushNotificaitonUrl": "http://test.com/test",
	"gpio": {
		"fan": "16",
		"deIcer": "18",
		"ledOn": "11"
	}
};

var controllerSettings = function () {

	//read the settings file.
	var settings = JSON.parse(_fs.readFileSync('settings.json', 'utf8'));
	console.log ('loaded settings:', JSON.stringify(settings));

	return _extend ( true, baseSettings, settings );
}

module.exports = controllerSettings;
