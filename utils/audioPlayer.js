const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const path = require('path');

module.exports = {
    playSound: (channel, filePath) => {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(path.join(__dirname, filePath), { inputType: 'mp3' });

        player.play(resource);
        connection.subscribe(player);

        player.on('error', (error) => {
            console.error(`Erreur de lecture : ${error.message}`);
        });

        player.on('idle', () => {
            console.log('Le son a terminé de jouer. Déconnexion...');
            connection.destroy();
        });

        return connection;
    },
};
