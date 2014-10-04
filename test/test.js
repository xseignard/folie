var dgram = require('dgram'),
	Player = require('../src/player'),
	player = new Player(__dirname + '/../srt/folie.srt');

// arduinos IP/PORT
var host = '192.168.2.';
var first = 2;
var port = 8888;

var client = dgram.createSocket('udp4');

client.on('listening', function () {
	var address = client.address();
	console.log('UDP client listening on ' + address.address + ':' + address.port);
});

// message is received when the display ended scrolling the current text
client.on('message', function (message, remote) {
	console.log(remote.address + ':' + remote.port +' - ' + message);
	var next = parseInt(remote.address.substr(host.length, remote.length)) + 1;
	sendText(message, host + next);
});

client.bind(3333, '192.168.2.1');

player.on('ready', function() {
	player.readNext();
});

player.on('stop', function() {
	//sendText('#');
	//console.log('stop');
});

player.on('next', function(next) {
	sendText(next.text, host + first);
	console.log(next.text);
	player.readNext();
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
		console.log('UDP message sent to ' + host +':'+ port);
	});
};