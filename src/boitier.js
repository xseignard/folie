var SerialPort = require('serialport').SerialPort
	util = require('util'),
	EventEmitter = require('events').EventEmitter;


var Boitier = function(port) {
	var self = this,
		sp = new SerialPort(port),
		tmp = '';

	sp.on('open', function() {
		self.emit('ready');
		// get current value of potentiometer
		sp.write('#');
	});
	sp.on('data', function(data) {
		tmp += data.toString();
		if (tmp.indexOf('\r') >= 0) {
			tmp = Math.round(map(parseInt(tmp), 1, 99, 1, 1000));
			if (tmp < 10) {
				tmp = '000' + tmp;
			}
			else if (tmp < 100) {
				tmp = '00' + tmp;
			}
			else if (tmp < 1000) {
				tmp = '0' + tmp;
			}
			//var msg = parseInt(tmp) < 10 ? '0' + parseInt(tmp) : '' + parseInt(tmp);
			self.emit('change', tmp);
			tmp = '';
		}
	});

	var map = function (value, low1, high1, low2, high2) {
		return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
	}
};
util.inherits(Boitier, EventEmitter);

module.exports = Boitier;