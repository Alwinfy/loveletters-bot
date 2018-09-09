	
module.exports = (client, Ticket) => ({
	announcer: channel => channel.send.bind(channel),
	whisperer: handle => {
		const author = client.users.find('tag', handle);
		return author.send.bind(author);
	},
	asker: channel => (handle, question, callback) => {
		channel.send(question);
		return (function ask() {
			new Ticket(m => m.author.tag == handle && m.channel.id == channel.id, msg => {
				if(!callback(msg.content.trim()))
					ask();
			});
		})();
	}
});
