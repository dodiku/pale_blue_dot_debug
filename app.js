var express = require('express');
var app = express();
var Request = require('request');
var http = require('http').Server(app);
// var io = require('socket.io')(http);

// *************************
// SETUP
// *************************

app.set("views", __dirname + '/views');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.use(express.static( __dirname + '/public' ));

var port = process.env.PORT || 3000;

// *************************
// CONFIGURATIONS
// *************************

// debug variables
var h = 20;
var w = 20;
var increment = 8;
var limit = 800;
var timeInterval = 3000;
var restartInterval = 300000;
var final = 0;

// live variables
// var h = 10;
// var w = 10;
// var increment = 1;
// var limit = 1200;
// var timeInterval = 3000;
// var restartInterval = 300000;
// var final = 0;

// *************************
// ROUTERS
// *************************
app.get('/', function(req, res){
  console.log('user enters..');
  res.render('index');
});

app.get("*", function(req, res){
	res.send('Ooops.. nothing here.');
});


var server = app.listen(port);
console.log("App is served on localhost: " + port);

var io = require('socket.io').listen(server);
var userCount = 0;


io.on('connection', function(socket){
  userCount = userCount + 1;
  console.log('a user connected');
  console.log('number of connected users: ' + userCount);
  io.sockets.emit('userCount', userCount);
  socket.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});

  socket.on('disconnect', function(){
    userCount = userCount - 1;
    console.log('user disconnected');
    console.log('number of connected users: ' + userCount);
    io.sockets.emit('userCount', userCount);
  });

  socket.on('click', function(){
    console.log('got a click');
    console.log('w: ' + w);
    if (w < limit*0.6) {
      console.log("we're on the safe zone");
      h = h + increment;
      w = w + increment;
      io.sockets.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});
      setTimeout(reduceSize, timeInterval);
    }
    if (w >= limit*0.6 && w < limit) {
      console.log('in the itp zone');
      h = h + increment;
      w = w + increment;
      final = 1;
      io.sockets.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});
      setTimeout(reduceSize, timeInterval);
    }
    if (w >= limit){
      console.log('in the hello zone');
      final = 2;
      io.sockets.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});
      setTimeout(restart, restartInterval);
    }

  });

  socket.on('reduce', function(){
    h = h - increment;
    w = w - increment;
    io.sockets.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});
  });

  function reduceSize () {
    h = h - increment;
    w = w - increment;
    if (w < limit*0.6 && final === 1) {
      final = 0;
    }
    io.sockets.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});
  }

  function restart (){
    final = 0;
    console.log('restarting...');
    io.sockets.emit('dimensions', {h: h, w: w, limit: limit, restartInterval: restartInterval, final: final});
  }

});
