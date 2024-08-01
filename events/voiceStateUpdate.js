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
                
                // Check if the user who joined is the monitored user
                const monitoredUserId = '763495221727854672';
                const userId = newState.member.user.id;
                let soundFile = 'fart.mp3'; // Default sound

                if (userId === monitoredUserId) {
                    soundFile = 'special.mp3'; // Change this to your special sound file
                }

                const resource = createAudioResource(path.join(__dirname, '..', soundFile), { inputType: 'mp3' });

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
