function LoveLetters() {
	this.room = new Set;
	this.members = [];
	this.started = false;
	this.turn = 0;
}

LoveLetters.prototype.start = function(callback) {
