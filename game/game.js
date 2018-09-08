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
		this.deckpos = 1; // customary burn
	}

	LoveLetters.prototype.register = function(handle, name) {
		if(this.lobby[handle])
			this.announce('You\'re already in this game!');
		else if(this.started)
			this.announce('The game has started! You can\'t join!');
		else {
			this.lobby[handle] = name;
			this.announce(`Welcome, ${name}! The lobby has ${this.players.size} players now.`);
		}
	};
	LoveLetters.prototype.deregister = function(handle) {
		if(!this.lobby[handle])
			this.announce('You\'re not in this game!');
		else if(this.started)
			this.announce('The game is afoot! You can\'t leave now!');
		else {
			this.announce(`Goodbye, ${this.lobby[handle]}! The lobby has ${this.players.size - 1} players now.`);
			delete this.lobby[handle];
		}
	};
		
	LoveLetters.prototype.start = function() {
		if(this.started) {
			this.announce('Game has already started!');
			return;
		}
		this.started = true;
		for(const handle in this.lobby)
			this.players.push(new Player(handle, this.lobby[handle], this));
		for(let i=0; i<types.length; i++)
			for(let j=0; j<types[i].count; i++)
				this.deck.push(new Card(types[i]));
		for(let i=this.deck.length-1; i>0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		} // shuffle
		this.tick();
	}
	LoveLetters.prototype.stop = function() {
		if(!this.started) {
			this.announce('No game is running!');
			return;
		}
		const bigcard = this.players.reduce(function(l, r) {
			return Math.max(l.hand[0].val, r.hand[0].val);	
		}, 0);
		const winners = this.players.filter(function(p) {
			return p.hand[0].val >= bigcard;
		});
		this.announce(`The winner${winners.length === 1 ? ' is' : 's are'} ${winners.join(' and ')}`);
		this.players = [];
		this.deck = [];
		this.started = false;
	};
	LoveLetters.prototype.checkcard = function(word, cb) {
		const matches = [];
		for(let i=0; i<this.players.length; i++)
			if(word.toLowerCase().includes(this.players[i].name.toLowerCase())
				|| word.toLowerCase().includes(this.players[i].handle.toLowerCase()))
				matches.push(i);
		
		if(matches.length > 1)
			this.game.announce('Ambiguous player!');
		else if(!matches.length)
			this.game.announce('Not a valid player!');
		else return cb(matches[0]);
		return false;
	};
	LoveLetters.prototype.getplayer = function(query, handle, cb) {
		this.ask(handle, query, function(resp) {
			this.checkplayer(resp, cb);
		});
	};
	LoveLetters.prototype.checkcard = function(word, deck, cb) {
		const value = parseInt(word);
		const matches = [];
		for(let i=0; i<deck.length; i++)
			if(word.toLowerCase().includes(deck[i].name.toLowerCase())
				|| value === deck[i].val)
				matches.push(i);
		
		if(matches.length > 1)
			this.game.announce('Ambiguous card!');
		else if(!matches.length)
			this.game.announce('Not a valid card!');
		else return cb(matches[0]);
		return false;
	};
	LoveLetters.prototype.getcard = function(query, handle, deck, cb) {
		this.ask(handle, query, function(resp) {
			this.checkcard(resp, deck, cb);
		});
	};
	LoveLetters.prototype.play = function(card, me, you, guess) {
		card.func(me, you, guess);
		this.turn = (this.turn + 1) % this.players.length;
		if(this.players.length === 1 || this.deckpos >= this.deck.length - 1) // minus one for burncard
			this.stop();
		else
			this.tick(); // for TCO
	}
	LoveLetters.prototype.tick = function() {
		const player = this.players[this.turn];
		this.announce(`It is now ${player}'s turn.`);
		player.safe = false;
		player.draw();
		this.getcard(`What card would you like to play, ${player}?`, player.handle, player.hand, function(index) {
			if((player.hand[index].val === 5 || player.hand[index].val === 6)
				&& player.hand[!index].val === 7) {
				player.whisper('You must play the Seven card!');
				return false;
			}
			const card = player.hand.splice(index, 1);
			if(card.func.length > 1)
			return this.getplayer('Who would you like to target?', function(other) {
				if(other.safe) {
					this.announce('That person\'s Protected!');
					return false;
				}
				if(card.func.length > 2)
				return this.getcard('What card would you like to guess?', player.handle, cardtypes, function(index) {
					if(cardtypes[index].val === 1) {
						this.announce('You can\'t guess a Guess!');
						return false;
					}
					this.play(card, player, other, cardtypes[index]);
					return true;
				});
				this.play(card, player, other);
				return true;
			});
			this.play(card, player);
			return true;
		});
	};
	return LoveLetters;
};
