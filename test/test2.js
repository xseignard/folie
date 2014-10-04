var dgram = require('dgram');

// arduinos IP/PORT
var hosts = ['192.168.2.2'];
var port = 8888;

var client = dgram.createSocket('udp4');

client.on('listening', function () {
	var address = client.address();
	console.log('UDP client listening on ' + address.address + ":" + address.port);
});

client.on('message', function (message, remote) {
	console.log(remote.address + ':' + remote.port +' - ' + message);
});

client.bind(3333, '192.168.2.1');

var sendText = function (text) {
	var message = new Buffer(text);
	hosts.forEach(function(host) {
		client.send(message, 0, message.length, port, host, function(err, bytes) {
			console.log('UDP message sent to ' + host +':'+ port);
		});
	});
};

setInterval(function () {
	sendText('#010');
}, 3000);
