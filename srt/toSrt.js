var fs = require('fs'),
	readline = require('readline');

var out = fs.createWriteStream(__dirname + '/folie.srt', { encoding: 'binary' });

var rd = readline.createInterface({
	input: fs.createReadStream(__dirname + '/prologue.txt'),
	output: out,
	terminal: false
});

var i = 0;
var time = 0;
// 218 lignes en 5400 sec ==> une ligne tte les 25 secs
// format srt
// 00:00:20,000 --> 00:00:24,400

var toSrtTiming = function(time) {
	// convert seconds to HMS
	var hours = parseInt(time/3600) % 24;
	var minutes = parseInt(time/60) % 60;
	var seconds = time % 60;
	// prepend 0 if below 10
	hours = hours < 10 ? '0' + hours : hours;
	minutes = minutes < 10 ? '0' + minutes : minutes
	seconds = seconds  < 10 ? '0' + seconds : seconds
	// for now millis are not taken in account
	var millis = ',000';
	// construct srt timing format
	return hours + ':' + minutes + ':' + seconds + millis;
}

rd.on('line', function(line) {
	i++;
	var from = toSrtTiming(time);
	time += 25;
	var to = toSrtTiming(time);
	time += 0.25;
	out.write(new Buffer(i, 'binary'));
	out.write(new Buffer(from + ' --> ' + to));
	out.write(new Buffer(line));
});
