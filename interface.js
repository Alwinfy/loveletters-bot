	
module.exports = (client, Ticket) => ({
	announcer: channel => channel.send.bind(channel),
	whisperer: handle => {
		const author = client.users.find('tag', handle);
		return author.send.bind(author);
	},
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
