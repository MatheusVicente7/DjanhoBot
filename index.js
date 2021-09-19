// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const { token, prefix } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});
// Listen client interaction
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	}
	else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
	}
	else if (commandName === 'user') {
		await interaction.reply(`Sua tag: ${interaction.user.tag}\nSeu id: ${interaction.user.id}`);
	}
	else if (commandName === 'hello') {
		await interaction.reply('world!');
	}
	else if (commandName === 'dj') {
		await interaction.reply('Na Irlanda do Norte eu sou idolo !');
	}
});
// Reads client message
client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
	// eslint-disable-next-line no-undef
	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${prefix}play`)) {
		// eslint-disable-next-line no-undef
		execute(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}skip`)) {
		// eslint-disable-next-line no-undef
		skip(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}stop`)) {
		// eslint-disable-next-line no-undef
		stop(message, serverQueue);
		return;
	}
	else {
		message.channel.send('You need to enter a valid command!');
	}
});

// Login to Discord with your client's token
client.login(token);