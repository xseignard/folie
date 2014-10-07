var dgram = require('dgram'),
	keypress = require('keypress'),
	Player = require('../src/player'),
	player = new Player(__dirname + '/../srt/folie-250.srt');
	Boitier = require('../src/boitier.js'),
	boitier = new Boitier('/dev/cu.PL2303-00001014');
	Logger = require('../src/logger.js'),
	log = new Logger();

// arduinos IP/PORT
var host = '192.168.2.';
var first = 2;
var port = 8888;

// data from boitier
boitier.on('change', function(data) {
	sendText('#' + data, host + first);
	//log.fromBoitier('#' + data);
});

// app receiving messages
var client = dgram.createSocket('udp4');

client.on('listening', function () {});

// message is received when the display ended scrolling the current text
client.on('message', function (message, remote) {
	//log.fromClient(remote.address + ':' + remote.port +' - ' + message.toString('binary').substring(0, 20) + '...');
	var next = parseInt(remote.address.substr(host.length, remote.address.length)) + 1;
	//sendText(message, host + next);
});

client.bind(3333, '192.168.2.6');


// app sending messages
player.on('ready', function() {
});

player.on('next', function(next) {
	sendText(next.text, host + first);
});

player.on('previous', function(previous) {
	sendText(previous.text, host + first);
});

player.on('end', function() {
	process.exit();
});

process.on('exit', function() {
	console.log('end!');
});


var sendText = function (text, ip) {
	var message = new Buffer(text, 'binary');
	client.send(message, 0, message.length, port, ip, function(err, bytes) {
		//log.toClient(ip +':'+ port +' - ' + message.toString('binary'));
		console.log(message.toString('binary'));
		console.log('-------------------------');
	});
};


//
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