'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();

const {readFileSync} = require('fs');

let token;
try {
	token = readFileSync('./token.key').toString();
}
catch(e) {
	token = process.env.BOT_TOKEN || '';
}

const util = require('./util');
const commands = require('./commands') || {};
const Server = require('./server');
const dummy = Server.dummy();
const {checkAll} = require('./ticket');
let servers = {}, dms = {};


console.log(Server);
client.on('ready', function() {
	console.log(`Logged in as ${client.user.tag}!`);
	for(let guild of client.guilds.array()) {
	if(guild.available)
			servers[guild.id] = new Server(guild);
	}
});
client.on('guildMemberAdd', function(newbie) {
	let serv = servers[newbie.guild.id];
	if(serv)
		util.getDefaultChannel(newbie.guild)
			.send(`${newbie} ${serv.get('welcome')}`);
});
client.on('message', function(msg) {
	if(msg.author.id === client.user.id) return;
	let serv = (msg.channel.type == 'text' ? servers[msg.guild.id] :
		dms[msg.channel.id] = dms[msg.channel.id] || new Server(msg.channel));
	if(!serv) return;
	let prefix = serv.get('prefix');
	if(!msg.content.toLowerCase().startsWith(prefix)) {
		if(msg.content.startsWith(serv.get('replypfx')))
			checkAll(msg);
		return;
	}
	
	let content = msg.content.substr(prefix.length, msg.content.length);
	console.log(content);
	let args = util.argparse(content.replace(/\s+$/g, ''));
	let command = args.shift().toLowerCase();
	
	let cmd = commands[command];
	if(cmd) {
		(new Promise((resolve, reject) => {
			try {
				resolve(cmd.call(msg, serv, args));
			}
			catch (err) {
				reject(err);
			}
		})).catch(console.error);
	}
	else
		console.log(`Unknown command ${command}`);
});

client.login(token.trim());
