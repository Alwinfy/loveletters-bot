let tickets = {}, tid = 0;

function Ticket(field, value, callback) {
	this.call = callback;
	this.value = value;
	this.field = field;
	tickets[tid] = this;
	return tid++;
}

Ticket.prototype.check = function(msg) {
	return msg[this.field].id == this.value;
}

function checkAll(msg) {
	for(let i in tickets)
		if(tickets[i].check(msg)) {
			tickets[i].call(msg);
			delete tickets[i];
			break;
		}
}
function cancel(tid) {
	delete tickets[tid];
}

module.exports.Ticket = Ticket;
module.exports.checkAll = checkAll;
