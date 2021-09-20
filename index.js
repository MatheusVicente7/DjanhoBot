// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');
// eslint-disable-next-line no-unused-vars
const { token, prefix } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS] });

const queue = new Map();

client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const serverQueue = queue.get(message.guild.id);

	if (message.content.startsWith(`${prefix}play`)) {
		execute(message, serverQueue);
		return;
	}
	if (message.content.startsWith(`${prefix}dj`)) {
		execute(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}skip`)) {
		skip(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}pular`)) {
		skip(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}stop`)) {
		stop(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}parar`)) {
		stop(message, serverQueue);
		return;
	}
	else if (message.content.startsWith(`${prefix}help`)) {
		message.channel.send('!play ou !dj para tocar uma música; \n!skip ou !pular para tocar a próxima música;\n!stop ou !parar para parar de tocar uma música;');
		return;
	}
	else if (message.content.startsWith(`${prefix}repo`)) {
		message.channel.send('https://github.com/MatheusVicente7/DjanhoBot');
		return;
	}
	else if (message.content.startsWith(`${prefix}comandos`)) {
		message.channel.send('!play ou !dj para tocar uma música; \n!skip ou !pular para tocar a próxima música;\n!stop ou !parar para parar de tocar uma música;');
		return;
	}
	else {
		message.channel.send('Você precisa utilizar um comando válido seu lazarento!');
	}
});

async function execute(message, serverQueue) {
	const args = message.content.split(/(?<=^\S+)\s/);console.log(args);
	if (!args[1]) return message.channel.send('Presta atenção piá pançudo! Você precisa digitar o nome do vídeo ou o link!');
	let song = {};
	if (ytdl.validateURL(args[1])) {
		const song_info = await ytdl.getInfo(args[1]);
		song = {
			title: song_info.videoDetails.title,
			url: song_info.videoDetails.video_url,
		};
	}
	else {
		const video_finder = async (query) => {
			const video_result = await ytSearch(query);
			return (video_result.videos.length > 1) ? video_result.videos[0] : null;
		};
		const video = await video_finder(args[1]);
		console.log(video);
		console.log(args[1]);
		if (video) {
			song = { title: video.title, url: video.url };
		}
		else {
			message.channel.send('Desculpa, o Djanho foi incapaz de achar o vídeo do floquinho de neve! Tente novamente.');
		}
	}
	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) {
		return message.channel.send(
			'Você precisa estar em um canal de aúdio para escutar música!',
		);
	}
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send(
			'O Djanho precisa de permissão para acessar o canal',
		);
	}


	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			const connection = await voiceChannel.join();
			queueContruct.connection = connection;

			play(message.guild, queueContruct.songs[0]);
		}
		catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	}
	else {
		serverQueue.songs.push(song);
		return message.channel.send(`${song.title} foi adicionado a lista!`);
	}
}

function skip(message, serverQueue) {
	if (!message.member.voice.channel) {
		return message.channel.send(
			'Você precisa estar em um canal de aúdio para escutar música!',
		);
	}
	if (!serverQueue) {return message.channel.send('Não tem música tocando no momento');}
	serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
	if (!message.member.voice.channel) {
		return message.channel.send(
			'Você precisa estar em um canal de aúdio para escutar música!',
		);
	}

	if (!serverQueue) {return message.channel.send('Não tem música tocando no momento');}

	serverQueue.songs = [];
	serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on('finish', () => {
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Música: **${song.title}**`);
}
client.login(token);