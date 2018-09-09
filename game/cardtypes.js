function CardType(count, name, desc, val, func) {
	this.count = count;
	this.name = name;
	this.desc = desc;
	this.val = val;
	this.func = func;
}

//A - Guess
//2 - Spy
//3 - Compare
//4 - Protect
//5 - Drop
//6 - Swap
//7 - Priority
//8 - Death

const info = require('fs').readFileSync(__dirname + '/cardnames.tsv').toString().split('\n');
const plays = [
	(me, you, card) => {
		me.game.announce(`${me} guesses that ${you} holds a ${card}!`);
		if(you.hand[0].val === card.val)
			you.die('guess');
		else
			me.game.announce('But it\'s wrong!');
	},
	(me, you) => {
		me.game.announce(`${me} peeks at ${you}'s card.`);
		me.whisper(`${you} holds a ${card} card.`);
	},
	(me, you) => {
		me.game.announce(`${me} and ${you} compare cards!`);
		if(me.hand[0].val < you.hand[0].val)
			me.die('three');
		else if(me.hand[0].val > you.hand[0])
			you.die('three');
		else me.game.announce('The cards are equal! Nobody\'s out!');
	},
	me => {
		me.game.announce(`${me} is protected until their next turn!`);
		me.safe = true;
	},
	(me, you) => you.discard(),
	(me, you) => {
		me.game.announce(`${me} and ${you} swap cards.`);
		[me.hand, you.hand] = [you.hand, me.hand];
		[you, me].forEach(p => p.whisper(`You now hold a ${p.hand} card.`));
	},
	me => {},
	me => me.die('eight')
];

const cardtypes = [];
for(let i=0; i<plays.length; i++) {
	const [c, n, d] = info[i].split('\t');
	cardtypes.push(new CardType(+c, n, d, i + 1, plays[i]));
}

module.exports = cardtypes;
