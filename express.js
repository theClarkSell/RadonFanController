
//EXPRESS 

var express   = require('express');

var _app = express();

_app.get('/', function (req, res) {
  res.send('Hello World!');
})

_app.get('/fan/on', function (req, res) {
  console.log('turning fan on');

  relayController.on(_pinFan);
  
  res.send('fans on');
})

_app.get('/fan/off', function (req, res) {
  console.log('turning fan off');

  relayController.off(_pinFan);
  
  res.send('fans off');
})

var server = _app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Radon Controller listening at http://%s:%s', host, port);

})