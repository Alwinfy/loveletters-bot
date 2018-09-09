	
module.exports = (client, Ticket) => ({
	announcer: channel => channel.send.bind(channel),
	whisperer: handle => {
		const author = client.users.find('tag', handle);
		return author.send.bind(author);
	},
	asker: channel => (handle, question, callback) => {
		channel.send(question);
		return (function ask() {
			new Ticket(m => {console.log(m.author.tag + ' ' + handle); return m.author.tag == handle}, msg => {
				console.log(msg.content);
				if(!callback(msg.content.trim()))
					ask();
			});
		})();
	}
});
