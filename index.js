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

const queue = new Map();

async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	const voiceChannel = message.member.voice.channel;

	if (!voiceChannel) {
		return message.channel.send(
			'Você precisa estar em um Canal de Voz para escutar uma música!');
	}
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send(
			'O Djanho precisa de permissão para entrar e falar em seu canal de voz');
	}
	// ytdl safes info video into a object
	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.videoDetails.title,
		url: songInfo.videoDetails.video_url,
	};

	if (!serverQueue) {
		// Creates a contract for the queue
		const queueContract = {
			textChannel : message.channel,
			voiceChannel : voiceChannel,
			connection : null,
			songs : [],
			volume: 5,
			playing : true,
		};
		// Setting the queue using our contract
		queue.set(message.guild.id, queueContract);

		// Pushing the song to our songs array
		queueContract.songs.push(song);

		try {
			const connection = await voiceChannel.join();
			queueContract.connection = connection;

			play(message.guild, queueContract.songs[0]);

		}
		catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	}
	else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} foi adicionada a playlist`);
	}
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	
}



// Login to Discord with your client's token
client.login(token);