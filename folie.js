var dgram = require('dgram'),
	osc = require('node-osc'),
	oscServer = new osc.Server(5001, '0.0.0.0'),
	oscClient = new osc.Client('localhost', 5000),
	Player = require('./src/player'),
	player = new Player(__dirname + '/srt/folie-250.srt'),
	prologuePlayer;

// arduinos IP/PORT
var host = '192.168.2.';
var first = 2;
var last = 5;
var port = 8888;
// app receiving messages
var client = dgram.createSocket('udp4');

// current text that is displayed
var current = '';
// default speed
var defaultSpeed = 10;
// current speed
var currentSpeed = 10;

// switch to know if we are in prologue mode
var prologue = false;

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

client.bind(3333, '192.168.2.6');

// player for the actes
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
	console.log('Fin !');
	console.log('-------------------------');
});

var sendText = function (text, ip) {
	var message = new Buffer(text, 'binary');
	client.send(message, 0, message.length, port, ip);
};


// wii
oscServer.on('message', function (msg, rinfo) {
	var route = msg[0],
		value = msg[1];

	if (!value) {
		switch(route) {
			case '/wii/1/button/A':
			case '/wii/2/button/A':
				if (!prologue) player.next();
				break;
			case '/wii/1/button/B':
			case '/wii/2/button/B':
				if (!prologue) player.replay();
				break;
			case '/wii/1/button/Down':
			case '/wii/2/button/Down':
				if (!prologue) player.previous();
				break;
			case '/wii/1/button/Minus':
			case '/wii/2/button/Minus':
				var msg = '';
				currentSpeed += 3;
				if (currentSpeed > 19) currentSpeed = 19;
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
				currentSpeed -= 3;
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
				if (!prologue) player.i = -1;
				break;
			case '/wii/1/button/Up':
			case '/wii/2/button/Up':
				if (!prologue) player.i = 114;
				break;
			case '/wii/1/button/Right':
			case '/wii/2/button/Right':
				if (!prologue) player.i = 139;
				break;
			case '/wii/1/button/1':
			case '/wii/2/button/1':
				prologue = true;
				if (prologuePlayer) prologuePlayer.clearTimeouts();
				prologuePlayer = new Player(__dirname + '/srt/prologue.srt');
				prologuePlayer.on('ready', function(){
					prologuePlayer.timing();
				});
				prologuePlayer.on('next', function(next) {
					if (prologue) {
						current = next;
						console.log(current.text);
						console.log('-------------------------');
						if (current.text[0] === '#') {
							for (var i = first; i <= last; i++) {
								sendText(current.text, host + i);
							}
							if (current.text === '#0004') oscClient.send('/millumin/action/launchColumn', 1);
						}
						else {
							sendText(current.text, host + first);
						}
						prologuePlayer.timing();
					}
				});
				prologuePlayer.on('end', function() {
					if (prologue) {
						prologuePlayer.i = 0;
						prologuePlayer.timing();
					}
				});
				break;
			case '/wii/1/button/2':
			case '/wii/2/button/2':
				prologue = false;
				if (prologuePlayer) prologuePlayer.clearTimeouts();
				break;
		}
	}
});