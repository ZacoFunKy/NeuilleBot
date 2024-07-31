const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');

module.exports = (oldState, newState) => {
    console.log(`État vocal mis à jour : ${oldState.channelId} -> ${newState.channelId}`);
    if (oldState.channelId === null && newState.channelId !== null) {
        console.log(`Un utilisateur a rejoint le canal vocal : ${newState.channel.name}`);
        const channel = newState.channel;

        if (channel) {
            console.log(`Tentative de connexion au canal : ${channel.name}`);
            try {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });

                connection.on('error', (error) => {
                    console.error(`Erreur de connexion : ${error.message}`);
                });

                const player = createAudioPlayer();
                const resource = createAudioResource(path.join(__dirname, '..', 'fart.mp3'), { inputType: 'mp3' });

                player.play(resource);
                connection.subscribe(player);

                player.on(AudioPlayerStatus.Idle, () => {
                    console.log('Le son a terminé de jouer. Déconnexion...');
                    connection.destroy();
                });

                player.on('error', (error) => {
                    console.error(`Erreur de lecture : ${error.message}`);
                });

                console.log('Connexion et lecture du son lancées.');
            } catch (error) {
                console.error(`Erreur lors de la connexion ou de la lecture : ${error.message}`);
            }
        } else {
            console.log('Le canal vocal n\'existe pas.');
        }
    }
};
