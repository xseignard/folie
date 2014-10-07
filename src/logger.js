var chalk = require('chalk');

var Logger = function() {};

Logger.prototype.toClient = function(msg) {
	var tag = chalk.bold.red('[To client] ');
	tag += msg;
	console.log(tag);
};

Logger.prototype.fromClient = function(msg) {
	var tag = chalk.bold.blue('[From client] ');
	tag += msg;
	console.log(tag);
};

Logger.prototype.fromBoitier = function(msg) {
	var tag = chalk.bold.green('[From boitier] ');
	tag += msg;
	console.log(tag);
};

module.exports = Logger;
