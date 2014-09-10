
/**
 * Module dependencies.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
 
app.configure(function () {
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function(req, res){
  res.sendfile('public/static/logo.html');
});

io.on('connection', function(socket){

});

http.listen(18080, function(){
  console.log('Express server listening on port ' + app.get('port'));
});
