var fs = require('fs'),
	parser = require('subtitles-parser'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter;

var to1, to2;

var Player = function(srtFile) {
	this.srt;
	this.current;
	this.i = -1;
	var self = this;
	fs.readFile(srtFile, 'binary', function(err, data) {
		if (err) throw err;
		self.srt = parser.fromSrt(data, true);
		self.emit('ready');
	});
};
util.inherits(Player, EventEmitter);


Player.prototype.timing = function() {
	if (this.i <= 0) this.i = 0;
	var self = this;
	if (self.i < self.srt.length) {
		var next = self.srt[self.i];
		var stopTimeout = self.current ? self.current.endTime - self.current.startTime : 0;
		var nextTimeout = self.current ? next.startTime - self.current.endTime : 0;
		to1 = setTimeout(function() {
			self.emit('stop');
			to2 = setTimeout(function() {
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

Player.prototype.next = function() {
	this.i++;
	if (this.i < this.srt.length) {
		var next = this.srt[this.i];
		this.current = next;
		this.emit('next', next);
	}
	else {
		this.emit('end');
	}
};

Player.prototype.previous = function() {
	if (this.i >= 0) {
		this.i--;
		if (this.i <= 0) this.i = 0;
		var previous = this.srt[this.i];
		this.current = previous;
		this.emit('previous', previous);
	}
};

Player.prototype.replay = function() {
	if (this.current) this.emit('next', this.current);
};

Player.prototype.clearTimeouts = function() {
	clearTimeout(to1);
	clearTimeout(to2);
};

module.exports = Player;