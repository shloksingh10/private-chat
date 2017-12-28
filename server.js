var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = {};
connections = [];


app.use(express.static(path.join(__dirname, 'dist')));

server.listen(process.env.PORT || 3000);
console.log('Server Running ....');



app.get('/',function (req, res) {
  res.sendFile(__dirname+'/src/index.html');
});

io.sockets.on('connection', function (socket) {
  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);
  updateUsernames();
  //Disconnect
  socket.on('disconnect', function (data) {
    if(!socket.username)
      return;
    delete users[socket.username];
    updateUsernames();
    connections.splice(connections.indexOf(socket),1);
    io.sockets.emit('validate request', socket.username);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  //Send Message
  socket.on('send message', function (data) {
    //console.log(data);
    var pdata = socket.username+": "+data;
    io.sockets.emit('new message', {msg: pdata});
  });

  // new user
  socket.on('new user', function (data, callback) {
    if(data in users){
      callback(false);
    }
    else {
      callback(true);
      //console.log('Connected: ' + data);
      socket.username = data;
      users[socket.username] = socket;
      updateUsernames();
    }

  });

  //send request
  socket.on('send request', function (data) {
    users[data.receive].emit('incoming request',data.send);
  });
  //accept request
  socket.on('accept request', function (data) {
    //console.log(data.user1);
    //console.log(data.user2);
    users[data.user1].emit('show chat',data.user2);
    users[data.user2].emit('show chat',data.user1);
    io.sockets.emit('validate request',data.user2);
    io.sockets.emit('validate request',data.user1);
  });
  socket.on('video transfer', function (data) {
    //console.log(data.receiver);
    if(data.receiver in users){
      users[data.receiver].emit('play video', data.vid);
    }
  });
  function updateUsernames() {
    io.sockets.emit('get users', Object.keys(users));
  }
});
