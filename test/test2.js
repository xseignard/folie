var dgram = require('dgram'),
	keypress = require('keypress'),
	app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	path = require('path'),
	Player = require('../src/player'),
	player = new Player(__dirname + '/../srt/folie-250.srt');

// arduinos IP/PORT
var host = '192.168.2.';
var first = 3;
var port = 8888;

// current text that is displayed
var current = '';

// data from boitier
boitier.on('change', function(data) {
	console.log('#' + data);
	console.log('-------------------------');
	for (var i = first; i <= 5; i++) {
		sendText('#' + data, host + i);
	}
});

// app receiving messages
var client = dgram.createSocket('udp4');

// message is received when the display ended scrolling the current text
client.on('message', function (message, remote) {
	var next = parseInt(remote.address.substr(host.length, remote.address.length)) + 1;
	if (next <= 4) {
		console.log('###############' + next);
		sendText(current.text, host + next);
	}
});

client.bind(3333, '192.168.2.6');


// app sending messages
player.on('next', function(next) {
	current = next;
	console.log(current.text);
	console.log('-------------------------');
	sendText(current.text, host + first);
});

player.on('previous', function(previous) {
	current = previous;
	console.log(current.text);
	console.log('-------------------------');
	sendText(current.text, host + first);
});

player.on('end', function() {
	process.exit();
});

process.on('exit', function() {
	console.log('end!');
});


var sendText = function (text, ip) {
	var message = new Buffer(text, 'binary');
	client.send(message, 0, message.length, port, ip);
};


// control from the keyboard
keypress(process.stdin);

// listen for the keypress event
process.stdin.on('keypress', function (ch, key) {
	if (key && key.ctrl && key.name == 'c') {
		process.exit();
	}
	else {
		switch (key.name) {
			case 'up':
			case 'right':
				player.next();
				break;
			case 'down':
			case 'left':
				player.previous();
				break;
		}
	}
});

process.stdin.setRawMode(true);
process.stdin.resume();

// control from a webapp
app.get('/', function(req, res){
	var index = path.join(__dirname, '../public', 'index.html');
	res.sendFile(index);
});

io.on('connection', function(socket){
	socket.on('prev', function(){
		player.previous();
	});
	socket.on('next', function(){
		player.next();
	});
	socket.on('interval', function(interval){
		console.log('#00' + interval);
		console.log('-------------------------');
		for (var i = first; i <= 5; i++) {
			sendText('#00' + interval, host + i);
		}
	});
});

http.listen(3000);
