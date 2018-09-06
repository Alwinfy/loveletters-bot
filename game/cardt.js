function CardType(name, count, desc, val, func) {
	this.name = name;
	this.count = count;
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

const plays = [
	(me, you, card) => you.hand[0].val == card.val && you.die(),
	(me, you) => me.whisper(`${you} holds a ${card} card`),
	(me, you) => {
		if(me.hand[0].val < you.hand[0].val)
			me.die();
		else if(me.hand[0].val > you.hand[0])
			you.die();
		else announce('The cards are equal! Nobody\'s out!');
	},
	me => me.safe = true,
	(me, you) => you.discard(),
	(me, you) => {
		[me.hand, you.hand] = [you.hand, me.hand];
		[you, me].forEach(p => p.whisper(`You now hold a ${p.hand} card`));
	},
	me => {},
	me => me.die()
];

//pass "cardnames.tsv" as arg2
module.exports = function(announce, datapath) {
	const info = require('fs').readFileSync(__dirname + '/' + datapath).toString().split('\n');
	
	for(let i=0; i<plays.length; i++)
		cardtypes.push(new Card(...info[i].split('\t'), i + 1, plays[i]));
	
	return cardtypes;
}
