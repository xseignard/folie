var template = {
	index: 0,
	waitBulle: 0,
	triggerBulle: false,
	waitHuman: false
};

var random = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

var out = [];

for (var i = 1; i < 218; i++) {
	var current = JSON.parse(JSON.stringify(template));
	current.index = i;
	current.waitBulle = random(0, 5);
	out.push(current);
}

console.log(JSON.stringify(out));