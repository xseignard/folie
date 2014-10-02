var dgram = require('dgram'),
	Player = require('../src/player'),
	player = new Player(__dirname + '/../srt/folie.srt');

// arduinos IP/PORT
var hosts = ['192.168.2.2'];
var port = 8888;

var client = dgram.createSocket('udp4');

player.on('ready', function() {
	player.readNext();
});

player.on('stop', function() {
	//sendText('#');
	console.log('stop');
});

player.on('next', function(next) {
	sendText(next.text);
	console.log(next.text);
	player.readNext();
});

player.on('end', function() {
	process.exit();
});

process.on('exit', function() {
	console.log('end!');
});


var sendText = function (text) {
	var message = new Buffer(text);
	hosts.forEach(function(host) {
		client.send(message, 0, message.length, port, host, function(err, bytes) {
			console.log('UDP message sent to ' + host +':'+ port);
		});
	});
};