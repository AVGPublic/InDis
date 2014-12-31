
/**
 * Module dependencies.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var add_data_url = 'virtualsport_demo1/virtualsport_pack/data/BWM_ad_data.json';
app.configure(function () {
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/change_ad_data_toBWM', function(req, res){
	add_data_url = 'virtualsport_demo1/virtualsport_pack/data/BWM_ad_data.json';
	res.redirect('/controlpanel');
});
app.get('/change_add_data_toWanda', function(req, res){
	add_data_url = 'virtualsport_demo1/virtualsport_pack/data/Wanda_ad_data.json';
	res.redirect('/controlpanel');
});

app.get('/add_data', function(req,res){
	res.redirect(add_data_url);
});

app.get('/controlpanel', function(req, res){
  res.sendfile('public/static/controlpanel.html');
});

app.get('/test', function(req, res){
  res.sendfile('public/virtualsport_demo1/test.html');
});

app.get('/test2', function(req, res){
  res.sendfile('public/gameadv_demo1/test2.html');
});

app.get('/', function(req, res){
  res.sendfile('public/static/mainpage.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(80, function(){
  console.log('Express server listening on port ' + app.get('port'));
});
