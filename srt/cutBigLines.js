var fs = require('fs'),
	readline = require('readline'),
	iconv = require('iconv-lite');

var rd = readline.createInterface({
	input: fs.createReadStream(__dirname + '/folie.txt').pipe(iconv.decodeStream('ISO-8859-1')),
	output: null,
	terminal: false
});

var i = 0;

rd.on('line', function(line) {
	i++;
	if (line.length > 250) {
		var closest = findClosest(line, Math.floor(line.length/2));
		if (line[Math.floor(line.length/2) - closest - 1] !== '.') {
			closest*=-1;
		}
		var one = line.substring(0,Math.floor(line.length/2) - closest);
		var two = line.substring(Math.floor(line.length/2) - closest + 1, line.length);
		console.log(one);
		console.log(two);
	}
	else {
		console.log(line);
	}
});





var findClosest = function(text, middle) {var indices = [];for(var j=0; j<text.length;j++) {if (text[j] === '.') indices.push(Math.abs(middle - (j+1)));}var closest = Math.min.apply(null, indices);return closest;};