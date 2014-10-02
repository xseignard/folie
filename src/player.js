var fs = require('fs'),
	parser = require('subtitles-parser'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

var Player = function(srtFile) {
	this.srt;
	this.current;
	this.i = 0;
	var self = this;
	fs.readFile(srtFile, 'utf-8', function(err, data) {
		if (err) throw err;
		self.srt = parser.fromSrt(data, true);
		self.emit('ready');
	});
};
util.inherits(Player, EventEmitter);


Player.prototype.readNext = function() {
	var self = this;
	if (this.i < self.srt.length) {
		var next = self.srt[self.i];
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
		self.emit('end');
	}
};

module.exports = Player;