const {spawn} = require('child_process');

function Query() {
	let self = this;
	this.callbacks = [];
	this.process = spawn('src/buzzquery');
	this.types = {};
	this.process.stdout.on('data', function(data) {
		self.callbacks.shift()(data.toString().trim());
	});
	this.queue('h', function(help) {
		help.split('\n').forEach(function(v) {
			if(!v) return;
			let [name, desc] = v.replace(' ', '\0').split('\0');
			self.types[name] = desc;
		});
	});
}

Query.prototype.queue = function(input, func) {
	this.callbacks.push(func);
	this.process.stdin.write(input + '\n');
}

Query.prototype.query = function(query, func) {
	console.log(`Query: "${query}"`);
	this.queue('c ' + query, func);
}

module.exports = Query;
