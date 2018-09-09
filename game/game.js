module.exports = function(io) {
	const cardtypes = require('./cardtypes.js'), Card = require('./card.js');
	const cardnames = new Set(cardtypes.map(function(c) {
		return c.name.toLowerCase();
	}));
	const Player = require('./player.js')(io.whisperer);
	function LoveLetters(channel) {
		this.announce = io.announcer(channel);
		this.ask = io.asker(channel);
		this.lobby = {};
		this.players = [];
		this.deck = [];
		this.started = false;
		this.turn = 0;
		this.deckpos = 0;
		this.announce('Game initialized!');
	}

	LoveLetters.prototype.register = function(handle, name) {
		if(this.lobby[handle])
			this.announce('You\'re already in this game!');
		else if(this.started)
			this.announce('The game has started! You can\'t join!');
		else {
			this.lobby[handle] = name;
			const players = Object.keys(this.lobby).length;
			this.announce(`Welcome, ${name}! The lobby has ${players} player${players == 1 ? '' : 's'} now.`);
		}
	};
	LoveLetters.prototype.deregister = function(handle) {
		if(!this.lobby[handle])
			this.announce('You\'re not in this game!');
		else if(this.started)
			this.announce('The game is afoot! You can\'t leave now!');
		else {
			const players = Object.keys(this.lobby).length - 1;
			this.announce(`Goodbye, ${this.lobby[handle]}! The lobby has ${players} player${players == 1 ? '' : 's'} now.`);
			delete this.lobby[handle];
		}
	}
	
	LoveLetters.prototype.start = function() {
		if(Object.keys(this.lobby).length < 1) {
			this.announce('LoveLetters needs at least two players!');
			return;
		}
		if(this.started) {
			this.announce('Game has already started!');
			return;
		}
		this.announce(`Starting game with ${Object.keys(this.lobby).length} players!`);
		this.started = true;
		for(let i=0; i<cardtypes.length; i++)
			for(let j=0; j<cardtypes[i].count; j++)
				this.deck.push(new Card(cardtypes[i]));
		for(let i=this.deck.length-1; i>0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		} // shuffle
		for(const handle in this.lobby)
			this.players.push(new Player(handle, this.lobby[handle], this));
		this.tick();
	}
	LoveLetters.prototype.stop = function() {
		if(!this.started) {
			this.announce('No game is running!');
			return;
		}
		const bigcard = this.players.map(function(p) {
			return p.hand[0].val;
		}).reduce(Math.max);
		const winners = this.players.filter(function(p) {
			return p.hand[0].val >= bigcard;
		});
		this.announce(`The game has ended! The winner${winners.length === 1 ? ' is' : 's are'} ${winners.join(', ')}.`);
		this.players = [];
		this.deck = [];
		this.started = false;
	};
	LoveLetters.prototype.checkplayer = function(word, cb) {
		const matches = [];
		for(let i=0; i<this.players.length; i++)
			if(word.toLowerCase().includes(this.players[i].name.toLowerCase())
				|| word.toLowerCase().includes(this.players[i].handle.toLowerCase()))
				matches.push(i);
		
		if(matches.length > 1)
			this.announce('Ambiguous player!');
		else if(!matches.length)
			this.announce('Not a valid player!');
		else return cb(matches[0]);
		return false;
	};
	LoveLetters.prototype.getplayer = function(query, handle, cb) {
		this.ask(handle, query, function(resp) {
			console.log('cack');
			return this.checkplayer(resp, cb);
		}.bind(this));
	};
	LoveLetters.prototype.checkcard = function(word, deck, cb) {
		const value = parseInt(word);
		const matches = [];
		for(let i=0; i<deck.length; i++)
			if(word.toLowerCase().includes(deck[i].name.toLowerCase())
				|| value === deck[i].val)
				matches.push(i);
		
		if(matches.length > 1 && matches[0].val !== matches[1].val)
			this.announce('Ambiguous card!');
		else if(!matches.length)
			this.announce('Not a valid card!');
		else return cb(matches[0]);
		return false;
	};
	LoveLetters.prototype.getcard = function(query, handle, deck, cb) {
		this.ask(handle, query, function(resp) {
			return this.checkcard(resp, deck, cb);
		}.bind(this));
	};
	LoveLetters.prototype.play = function(card, me, you, guess) {
		card.func(me, you, guess);
		this.turn = (this.turn + 1) % this.players.length;
		this.tick();
	}
	LoveLetters.prototype.tick = function() {
		if(this.players.length <= 1) {
			this.announce('Only one player remains!');
			this.stop();
			return;
		}
		if(this.deckpos >= this.deck.length - 1) { // minus one for burncard
			this.announce('The deck is empty!');
			this.stop();
			return;
		}
		const player = this.players[this.turn];
		this.announce(`It is now ${player}'s turn.`);
		player.safe = false;
		player.draw();
		setTimeout(function() {return this.getcard(`What card would you like to play, ${player}?`, player.handle, player.hand, function(index) {
			if((player.hand[index].val === 5 || player.hand[index].val === 6)
				&& player.hand[1 - index].val === 7) {
				player.whisper('You must play the Seven card!');
				return false;
			}
			const [card] = player.hand.splice(index, 1);
			if(card.func.length > 1)
			setTimeout(function() {return this.getplayer('Who would you like to target?', function(other) {
				if(other.safe) {
					this.announce('That person\'s Protected!');
					return false;
				}
				if(card.func.length > 2)
				setTimeout(function() {return this.getcard('What card would you like to guess?', player.handle, cardtypes, function(index) {
					if(cardtypes[index].val === 1) {
						this.announce('You can\'t guess a Guess!');
						return false;
					}
					this.play(card, player, other, cardtypes[index]);
					return true;
					}.bind(this));}.bind(this), 0);
				else this.play(card, player, other);
				return true;
			}.bind(this));}.bind(this), 0);
			else this.play(card, player);
			return true;
		}.bind(this));}.bind(this), 0);
	};
	return LoveLetters;
};
