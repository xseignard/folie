var fs = require('fs'),
	parser = require('subtitles-parser'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

var Player = function(srtFile, dataFile) {
	this.srt;
	this.data = {};
	this.current;
	this.i = 0;
	var self = this;
	fs.readFile(srtFile, 'binary', function(err, data) {
		if (err) throw err;
		self.srt = parser.fromSrt(data, true);
		if (dataFile) {
			fs.readFile(dataFile, function(err, data) {
				if (err) throw err;
				self.data = JSON.parse(data);
				self.emit('ready');
			});
		}
		else {
			self.emit('ready');
		}
	});
};
util.inherits(Player, EventEmitter);


Player.prototype.readNext = function(timing) {
	var self = this;
	if (self.i < self.srt.length) {
		var next = self.srt[self.i];
		for(var k in self.data[self.i]) next[k] = self.data[self.i][k];
		if (timing) {
			var stopTimeout = self.current ? self.current.endTime - self.current.startTime : 0;
			var nextTimeout = self.current ? next.startTime - self.current.endTime : 0;
			setTimeout(function() {
				self.emit('stop');
				setTimeout(function() {
					self.current = next;
					self.i++;
					self.emit('next', next);
				}, nextTimeout);
			}, stopTimeout);
		}
		else {
			self.current = next;
			self.i++;
			self.emit('next', next);
		}
	}
	else {
		self.emit('end');
	}
};

module.exports = Player;