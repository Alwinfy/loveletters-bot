
function Ticket(validate, callback) {
	this.call = callback;
	this.validate = validate;
	Ticket.tickets[tid] = this;
	return Ticket.tid++;
}
Ticket.tickets = {};
Ticket.tid = 0;

Ticket.checkall = function(msg) {
	for(let i in Ticket.tickets)
		if(Ticket.tickets[i].validate(msg)) {
			Ticket.tickets[i].call(msg);
			delete Ticket.tickets[i];
			break;
		}
};
Ticket.cancel = function(tid) {
	delete Ticket.tickets[tid];
};

module.exports.Ticket = Ticket;
