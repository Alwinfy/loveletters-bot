exports.argparse = function(str) {
	let spl = [''], esc = false, quot = true;
	for (let c of str) {
		if (esc) { // last character was a backslash, skip handling
			esc = false;
			spl[spl.length - 1] += '\\' + c;
			continue;
		}
		switch(c) {
		case '\\':
			esc = true; // escape next character
			break;
		case '"':
			quot = !quot;
			break;
		case ' ':
		case '\t':
		case '\n':
			if (quot && spl[spl.length - 1]) {
				spl.push(''); // split on unquoted spaces
				break;
			}
		default:
			spl[spl.length - 1] += c;
		}
	}
	return spl;
}

exports.getDefaultChannel = function(guild) {
	if(guild.channels.has(guild.id))
		return guild.channels.get(guild.id);

	if(guild.channels.exists('name', 'general'))
		return guild.channels.find('name', 'general');

	return guild.channels
	 .filter(c => c.type === 'text' &&
		 c.permissionsFor(guild.client.user).has('SEND_MESSAGES'))
	 .sort((a, b) => a.position - b.position ||
		 Long.fromString(a.id).sub(Long.fromString(b.id)).toNumber())
	 .first();
}
