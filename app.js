
/**
 * Module dependencies.
 */
var addons = require('./node_modules/videoproc/videoproc');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
 
app.configure(function () {
    app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function(req, res){
  res.sendfile('public/static/index.html');
});

app.get('/logo', function(req, res){
  res.sendfile('public/static/logo.html');
});

app.get('/demo_hawkeye', function(req, res){
  res.sendfile('public/static/demo_hawkeye.html');
});

app.get('/interactive_video', function(req, res){
  res.sendfile('public/static/interactive_video.html');
});

app.get('/interactive_display', function(req, res){
  res.sendfile('public/static/interactive_display.html');
});

io.on('connection', function(socket){
  socket.on('get location', function()
  {
	//var location = addons.getLocationFromFile();
	var location = addons.getLocation();
	io.emit('send location', location);
  });
  
  socket.on('get interactiveLayers', function()
  {
	 var interactivelayers = addons.getInteractiveObjects("E:\\InDis\\public\\interactivelayer\\15_18", 4);
	 io.emit('send interactivelayers', interactivelayers);
  });
});

http.listen(80, function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('C/C++ addons.hello() =', addons.hello());

});
