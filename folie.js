var dgram = require('dgram'),
	keypress = require('keypress'),
	express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	path = require('path'),
	osc = require('node-osc'),
	oscServer = new osc.Server(5001, '0.0.0.0'),
	Player = require('./src/player'),
	player = new Player(__dirname + '/srt/folie-250.srt');

// arduinos IP/PORT
var host = '192.168.2.';
var first = 2;
var last = 3;
var port = 8888;
// app receiving messages
var client = dgram.createSocket('udp4');

// current text that is displayed
var current = '';
// default speed
var defaultSpeed = 11;
// current speed
var currentSpeed = 11;

// set default speed
client.on('listening', function() {
	console.log('#00' + currentSpeed);
	console.log('-------------------------');
	for (var i = first; i <= last; i++) {
		sendText('#00' + currentSpeed, host + i);
	}
});

// message is received when the display ended scrolling the current text
client.on('message', function (message, remote) {
	var next = parseInt(remote.address.substr(host.length, remote.address.length)) + 1;
	if (next <= last) {
		sendText(current.text, host + next);
	}
});

client.bind(3333, '192.168.2.1');


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
app.use(express.static(__dirname + '/public'));

/*app.get('/', function(req, res){
	var index = path.join(__dirname, 'public', 'index.html');
	res.sendFile(index);
});*/

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
		for (var i = first; i <= last; i++) {
			sendText('#00' + interval, host + i);
		}
	});
});

http.listen(3000);


// wii
oscServer.on('message', function (msg, rinfo) {
	var route = msg[0],
		value = msg[1];

	if (!value) {
		switch(route) {
			case '/wii/1/button/A':
			case '/wii/2/button/A':
				player.next();
				break;
			case '/wii/1/button/B':
			case '/wii/2/button/B':
				player.previous();
				break;
			case '/wii/1/button/Minus':
			case '/wii/2/button/Minus':
				var msg = '';
				currentSpeed += 10;
				if (currentSpeed > 99) currentSpeed = 99;
				currentSpeed < 10 ? msg = '0' + currentSpeed : msg = currentSpeed;
				console.log('#00' + msg);
				console.log('-------------------------');
				for (var i = first; i <= last; i++) {
					sendText('#00' + msg, host + i);
				}
				break;
			case '/wii/1/button/Plus':
			case '/wii/2/button/Plus':
				var msg = '';
				currentSpeed -= 10;
				if (currentSpeed < 1) currentSpeed = 1;
				currentSpeed < 10 ? msg = '0' + currentSpeed : msg = currentSpeed;
				console.log('#00' + msg);
				console.log('-------------------------');
				for (var i = first; i <= last; i++) {
					sendText('#00' + msg, host + i);
				}
				break;
			case '/wii/1/button/Home':
			case '/wii/2/button/Home':
				currentSpeed = defaultSpeed;
				console.log('#00' + currentSpeed);
				console.log('-------------------------');
				for (var i = first; i <= last; i++) {
					sendText('#00' + currentSpeed, host + i);
				}
				break;
			case '/wii/1/button/Left':
			case '/wii/2/button/Left':
				player.i = -1;
				break;
			case '/wii/1/button/Up':
			case '/wii/2/button/Up':
				player.i = 97;
				break;
			case '/wii/1/button/Right':
			case '/wii/2/button/Right':
				player.i = 195;
				break;
		}
	}
});