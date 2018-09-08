	
module.exports = (client, Ticket) => ({
	announcer: channel => channel.send,
	whisperer: handle => client.users.find('tag', handle).send,
	asker: channel => (handle, question, callback) => {
		channel.send(question);
		return (function ask() {
			new Ticket(m => m.user.tag == handle, content => {
				if(!callback(content.trim()))
					ask();
			});
		})();
	}
});
