module.exports = function(client) {
	const discord = require('discord.js');
	const Session = require('./session');
	const Ticket = require('./ticket');
	const gameui = require('./interface')(client, Ticket);
	const LoveLetters = require('./game/game')(gameui);
	const {readFileSync} = require('fs');
	const splitter = new (require('grapheme-splitter'))();
	const commands = {};
	const games = {};
	function Command(callback, name, desc, visible=true) {
		this.call = callback;
		this.name = name;
		this.desc = desc;
		commands[this.name] = this;
		if(visible) {
			let pos;
			for(pos = 1; pos < this.name.length &&
				commands[this.name.substr(0, pos)]; pos++);
			commands[this.short = this.name.substr(0, pos)] = this;
		}
		else
			this.name += '\u200b';
	}
	
	const info = readFileSync('./info.txt').toString();
	const hearts = splitter.splitGraphemes('\u2764\uFE0F\uD83D\uDC96\uD83D\uDC97\u2661\uD83D\uDC95\uD83D\uDC93\u2665');
	const valentines = readFileSync('./loves.txt').toString().trim().split('\n');
	
	new Command(function(msg, serv) {
		let reply = '**LoveLettersBot** - a bot for playing Love Letters, forked from BuzzBot\n\n**__Commands:__**',
			prefix = serv.get('prefix');
		for(let cmd in commands)
			if(cmd === commands[cmd].name)
				reply += `\n${prefix}__${commands[cmd].short}__${cmd.substr(commands[cmd].short.length)} - \`${commands[cmd].desc}\``;
		reply += `\n\nTo reply to the bot's prompt, prefix your answer with \`${serv.get('replypfx')}\`. Please note that any persistent commands (setprefix, etc.) may not persist over a day.`
		msg.channel.send(reply);
	}, 'help', 'displays this help');
	new Command(function(msg, serv) {
		msg.channel.send(info.replace('PREFIX', serv.get('prefix'))
			.replace('REPLYPFX', serv.get('replypfx'))
			+ cardtypes.map(card => `${card.count}x ${card} - ${card.desc}`).join('\n'));
	}, 'info', 'displays general info about Love Letters');
	new Command(function(msg, serv, args) {
		if(msg.author.id === '273599683132260354')
			msg.channel.send(`\`\`\`${eval(args.join(' '))}\`\`\``);
	}, 'eval', 'debug T3T', false);
	new Command(function(msg, serv, args) {
		msg.channel.send('pong');
	}, 'ping', 'tests if the bot is online');

	new Command(function(msg, serv, args) {
		if(!games[msg.channel.id]) {
			msg.channel.send(`Initialize first with ${serv.get('prefix')}init!`);
			return;
		}
		games[msg.channel.id].start();
	}, 'start', 'start a game of Love Letters');

	new Command(function(msg, serv) {
		if(!games[msg.channel.id]) {
			msg.channel.send(`Initialize first with ${serv.get('prefix')}init!`);
			return;
		}
		games[msg.channel.id].stop();
		for(let i in Ticket.tickets)
			if(Ticket.tickets[i].validate(msg))
				delete Ticket.tickets[i]; // clean up loose ends
	}, 'stop', 'stop the current Love Letters game');

	new Command(function(msg, serv, args) {
		if(!games[msg.channel.id]) {
			msg.channel.send(`Initialize first with ${serv.get('prefix')}init!`);
			return;
		}
		games[msg.channel.id].register(msg.author.tag, msg.member.toString());
	}, 'join', 'joins the current game');
	new Command(function(msg, serv, args) {
		if(!games[msg.channel.id]) {
			msg.channel.send(`Initialize first with ${serv.get('prefix')}init!`);
			return;
		}
		games[msg.channel.id].deregister(msg.author.tag);
	}, 'leave', 'leaves the current game');
	new Command(function(msg, serv) {
		if(games[msg.channel.id]) {
			msg.channel.send(`Already initialized!`);
			return;
		}
		games[msg.channel.id] = new LoveLetters(msg.channel, function() {
			for(let i in Ticket.tickets)
				if(Ticket.tickets[i].validate(msg))
					delete Ticket.tickets[i]; // clean up loose ends
			delete games[msg.channel.id];
		});
	}, 'init', 'prepares the game for playing in this channel');
	new Command(function(msg, serv) {
		const game = games[msg.channel.id];
		if(!game) {
			msg.channel.send('Not initialized!');
			return;
		}
		let text = `**Number of players:** ${Object.keys(game.lobby).length}\n**Started:** ${game.started ? 'yes' : 'no'}`;
		if(game.started)
			text += `\n**Alive players:** ${game.players.length}\n**Current player:** ${game.players[game.turn]}\n**Deck position:** ${game.deckpos}/${game.deck.length-1}`;
		msg.channel.send(text);
	}, 'stats', 'gives the status of the current game');
	new Command(function(msg, serv, args) {
		serv.set('welcome', args.join(' '));
	}, 'setmsg', 'sets the server\'s welcome message', false);
	new Command(function(msg, serv, args) {
		serv.set('replypfx', args[0] || '$');
		msg.channel.send(`Reply prefix successfully set to ${serv.get('replypfx')}!`);
	}, 'setprefix', 'sets the server\'s bot reply prefix', false);
	new Command(function(msg, serv, args) {
		let embed = new (discord.RichEmbed || discord.MessageEmbed);
		embed.setTitle(hearts[Math.floor(Math.random() * hearts.length)]);
		embed.setImage(valentines[Math.floor(valentines.length * Math.random())]);
		msg.channel.send(embed);
	}, 'valentine', 'replies with a random valentine (i.e. Love Letter)');
	new Command(function(msg, serv, args) {
		const MAXLEN = 2000;
		let str = args.join('').replace(/\s+/g, '').toUpperCase();
		if(str[0] !== str[str.length - 1])
			str = `*${str}*`;
		let string = splitter.splitGraphemes(str);
		if(string.length < 6) {
			msg.channel.send("Sorry, that string's too short!");
			return;
		}
		
		let lines = Math.floor(string.length / 8) + 1;
		let offset = Math.floor(string.length / (2 * lines));
		let height = string.length - 1;
		let depth = offset * lines;
		let size = depth + string.length;
		if(size * size * 2 > MAXLEN) {
			msg.channel.send("Phrase too long!");
			return;
		}

		let strings = [];
		for(let i=0; i<size; i++)
			strings.push(Array(size).fill(' '));
		for(let i=0; i<2; i++)
			for(let j=0; j<2; j++)
				for(let k=0; k<=depth; k++)
					strings[i * height + k]
						[j * height + depth - k] = '/';
		for(let i=0; i<=lines; i++)
			for(let j=0; j<string.length; j++)
				strings[i * offset + j][(lines - i) * offset] =
				strings[i * offset][(lines - i) * offset + j] =
				strings[i * offset + j][(lines - i) * offset + height] =
				strings[i * offset + height][(lines - i) * offset + j] =
					string[j];

		msg.channel.send('```\n' +
			strings.map(str => str.join(' ').replace(/\s+$/, '')).join('\n')
			+ '\n```');
	}, 'cube', 'draws an ASCII cube using the specified text');
	new Command(function(msg) {
		msg.channel.fetchMessages({limit: 50})
			.then(function(messages) {
				return messages.filter(function(message) {
					return message.author.id === message.client.user.id;
				});
			}).then(function(messages) {
				let lastKey = messages.lastKey();
				for(let message of messages) {
					if(message[0] === lastKey) {
						message[1].delete().then(function() {
							console.log('Deleted the last few messages.')
						})
					} else {
						message[1].delete()
					}
				}
			})	
	}, 'clean', 'removes the last few bot replies');
	
	return commands;
}
