
function Ticket(validate, callback) {
	this.call = callback;
	this.validate = validate;
	Ticket.tickets[Ticket.tid] = this;
	return Ticket.tid++;
}
Ticket.tickets = {};
Ticket.tid = 0;

Ticket.checkall = function(msg) {
	const ticks = Object.keys(Ticket.tickets);
	for(let i=0; i<ticks.length;i++)
		if(Ticket.tickets[ticks[i]].validate(msg)) {
			Ticket.tickets[ticks[i]].call(msg);
			delete Ticket.tickets[ticks[i]];
			break;
		}
};
Ticket.cancel = function(tid) {
	delete Ticket.tickets[tid];
};

module.exports = Ticket;
