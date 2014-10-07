var dgram = require('dgram'),
	Player = require('../src/player'),
	player = new Player(__dirname + '/../srt/prologue.srt');
	Boitier = require('../src/boitier.js'),
	boitier = new Boitier('/dev/ttyUSB0');
	Logger = require('../src/logger.js'),
	log = new Logger();

// arduinos IP/PORT
var host = '192.168.2.';
var first = 2;
var port = 8888;

var start, end, size;

// data from boitier
boitier.on('change', function(data) {
	sendText('#' + data, host + first);
	log.fromBoitier('#' + data);
});

// app receiving messages
var client = dgram.createSocket('udp4');

client.on('listening', function () {});

// message is received when the display ended scrolling the current text
client.on('message', function (message, remote) {
	end = new Date();
	console.log('duration: ' + (end - start) / 1000 + ', size: ' + size);
	/*
	log.fromClient(remote.address + ':' + remote.port +' - ' + message.toString('binary').substring(0, 20) + '...');
	var next = parseInt(remote.address.substr(host.length, remote.address.length)) + 1;
	sendText(message, host + next);
	*/
});

client.bind(3333, '192.168.2.1');


// app sending messages
player.on('ready', function() {
	player.timing();
});

player.on('stop', function() {
	//sendText('#');
	//console.log('stop');
});

player.on('next', function(next) {
	sendText(next.text, host + first);
	size = next.text.length;
	//console.log(next.text);
	player.timing();
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
		//log.toClient(ip +':'+ port +' - ' + message.toString('binary').substring(0, 20) + '...');
		start = new Date();
	});
};

//////////////////
/*
var osc = require('node-osc');

var msgCount = 0;
var firstMsg = true;

var oscServer = new osc.Server(5001, '0.0.0.0');
oscServer.on('message', function (msg, rinfo) {
	msgCount++;
	if (firstMsg) {
		player.readNext(false);
		firstMsg = false;
		msgCount = 0;
	}
	else if (msgCount >= player.current.waitBulle) {
		player.readNext(false);
		msgCount = 0;
	}
	console.log(player.i);
	console.log(msgCount, player.current.waitBulle);
});
*/