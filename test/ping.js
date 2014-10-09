var ping = require('ping');

var hosts = ['192.168.2.2', '192.168.2.3'];
hosts.forEach(function(host){
	ping.sys.probe(host, function(isAlive){
		var msg = isAlive ? 'host ' + host + ' is alive' : 'host ' + host + ' is dead';
		console.log(msg);
	});
});