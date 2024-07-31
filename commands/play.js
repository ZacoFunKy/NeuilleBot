const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require('path');

module.exports = (message, args) => {
    if (!message.member.voice.channel) {
        return message.reply('Vous devez être dans un canal vocal pour utiliser cette commande.');
    }

    const channel = message.member.voice.channel;
    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(path.join(__dirname, '..', 'fart.mp3'), { inputType: 'mp3' });

    player.play(resource);
    connection.subscribe(player);

    player.on('error', (error) => {
        console.error(`Erreur de lecture : ${error.message}`);
    });

    player.on('idle', () => {
        console.log('Le son a terminé de jouer. Déconnexion...');
        connection.destroy();
    });

    message.reply('Lecture du son !');
};
