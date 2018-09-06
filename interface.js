	
module.exports = (client, Ticket) => {
	whisperer: handle => client.users.find('tag', handle).send,
	announcer: channel => channel.send,
	asker: channel => (handle, question, err, callback) => {
		channel.send(question);
		function ask() {
			new Ticket(m => m.user.tag == handle, content => {
				if(!callback(content.trim())) {
					channel.send(err);
					ask();
				}
			});
		}();
	}
}
