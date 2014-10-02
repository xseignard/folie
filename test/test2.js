var dgram = require('dgram');

// arduinos IP/PORT
var hosts = ['192.168.2.2'];
var port = 8888;

var client = dgram.createSocket('udp4');

var sendText = function (text) {
	var message = new Buffer(text);
	hosts.forEach(function(host) {
		client.send(message, 0, message.length, port, host, function(err, bytes) {
			console.log('UDP message sent to ' + host +':'+ port);
		});
	});
};


setInterval(function () {
	sendText('test');
}, 3000);