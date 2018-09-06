const {readFileSync, writeFileSync} = require('fs');

function readConf(path) {
	return JSON.parse(readFileSync(path));
}

function Server(guild) {
	console.log(`Guild instantiated, id ${guild.id}`);
	this.guild = guild;
	this.path = `./data/${this.guild.id}.json`;
	try {
		this.config = readConf(this.path);
	}
	catch(e) {
		this.config = readConf(`./data/template.json`);
		this.write();
	}
}
Server.dummy = function() {
	let ret = new Server({id: 'template'});
	ret.set = function() {};
	return ret;
};

Server.prototype.write = function() {
	writeFileSync(this.path, JSON.stringify(this.config));
};

Server.prototype.set = function(field, val) {
	this.config[field] = val;
	this.write();
};

Server.prototype.get = function(field) {
	return this.config[field];
};

Server.prototype.greet = function() {
	this.guild.defaultChannel.send(`${newbie}, ${this.get('welcome')}`);
};

module.exports = Server;
