function CardT(name, desc, count, func) {
	this.name = name;
	this.desc = desc;
	this.count = count;
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

module.exports = function CardT(announce) {
	let names;
	const cards = [
		new CardT('Guess', 5, (me, you, card) =>
			you.hand[0].val == card.val && you.die()),
		new CardT('Peek', 2, (me, you) =>
			me.whisper(`${you} holds a ${card} card`)),
		new CardT('Compare', 2, (me, you) => {
			if(me.hand[0].val < you.hand[0].val)
				me.die();
			else if(me.hand[0].val > you.hand[0]
				you.die();
			else announce('The cards are equal! Nobody\'s out!');
		}),
		new CardT('Protect', 2, me =>
			me.safe = true),
		new CardT('Drop', 2, (me, you) =>
			you.discard()),
		new CardT('Swap', 1, (me, you) => {
			[me.hand, you.hand] = [you.hand, me.hand];
			[you, me].forEach(p => p.whisper(`You now hold a ${p.hand} card`));
		}),
		new CardT('Priority', 1, me => {}),
		new CardT('Bomb', 1, me => {})
	];
	
	names = cards.map(card => card.name);
	for(let i=0; i<cards.length; i++) {
		cards[i].val = i + 1;
	}
	return cards;
}
