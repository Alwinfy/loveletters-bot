function Card(template) {
	Object.assign(this, template);
}

Card.prototype.toString = function() {
	return `**${this.name}** (**${this.val}**)`;
}

module.exports = Card;
