(function(){
	var socket = io();
	var prev = document.getElementById('prev');
	var next = document.getElementById('next');
	var slider = document.getElementById('interval');

	prev.onclick = function() {
		socket.emit('prev');
	};
	next.onclick = function() {
		socket.emit('next');
	};

	slider.onchange = function(e) {
		var newInterval = e.target.value;
		if (newInterval < 10) newInterval = '0' + newInterval;
		socket.emit('interval', newInterval);
	};
})();