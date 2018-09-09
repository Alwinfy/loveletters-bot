const deaths = {
	'eight': [
		' got eaten! Or is that Eighten?',
		' was forced to play the Eight (or just is an idiot).',
		'\'s family will be collecting on Sideways Infinity Insurance!',
		' couldn\'t pull their wEight.'
	],
	'three': [
		' had the lesser card',
		' failed to Greater Than.',
		' didn\'t measure up.',
		' ended up on the wrong side of the less-than sign.',
		' got Thryeeted!'
	],
	'guess': [
		' got RNG\'d.',
		'\'s card was guessed.',
		' was sleuth\'d.',
		' lost at Russian roulette.' 
	]
};
		
module.exports = function(whisperer) {
	function Player(handle, name, game) {
		this.handle = handle;
		this.name = name;
		this.safe = false;
		this.hand = [];
		this.whisper = whisperer(handle);
		this.game = game;
		this.draw();
	}
	Player.prototype.die = function(reason) {
		this.game.cplay--;
		this.game.players.splice(this.game.players.indexOf(this), 1);
		this.game.announce(`${this}${deaths[reason][Math.floor(Math.random() * deaths[reason].length)]} Their hand contained ${this.hand.length ? 'a ' + this.hand[0] : 'nothing'} when they got out. ${this.game.players.length} player${this.game.players.length !== 1 ? 's remain' : ' remains'}!`);
	};
	Player.prototype.discard = function() {
		this.game.announce(`${this} discards their card, revealing a ${this.hand[0]}!`);
		if(this.hand[0] === 8)
			this.die('eight');
		this.hand = [];
		this.draw();
	};
	Player.prototype.draw = function() {
		this.game.announce(`${this} draws a card.`);
		this.hand.push(this.game.deck[this.game.deckpos++]);
		this.whisper(`Your current hand: ${this.hand.join(', ')}.`);
	};
	Player.prototype.toString = function() {
		return this.name;
	};
	return Player;
}
