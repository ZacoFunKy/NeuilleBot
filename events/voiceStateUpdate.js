const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY; // Your Freesound API key

const RANDOM_FART_SOUND_URL = 'https://freesound.org/apiv2/search/text/?query=fart&fields=id&sort=downloads_desc&token=' + FREESOUND_API_KEY;
const SOUND_DETAILS_URL = `https://freesound.org/apiv2/sounds/`; // Base URL to get sound details

async function fetchRandomFartSound() {
    try {
        const response = await axios.get(RANDOM_FART_SOUND_URL);
        const sounds = response.data.results;

        if (sounds.length === 0) {
            throw new Error('No sounds found.');
        }

        // Choose a random sound from the list
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];

        // Fetch the sound details to get the download URL
        const soundDetailsResponse = await axios.get(`${SOUND_DETAILS_URL}${randomSound.id}/?token=${FREESOUND_API_KEY}`);
        const soundDetails = soundDetailsResponse.data;

        return soundDetails.previews['preview-hq-mp3'];
    } catch (error) {
        console.error(`Erreur lors de la récupération du son : ${error.message}`);
        return null;
    }
}

module.exports = async (oldState, newState) => {
    console.log(`État vocal mis à jour : ${oldState.channelId} -> ${newState.channelId}`);

    // Check if user joined a voice channel
    if (oldState.channelId === null && newState.channelId !== null) {
        console.log(`Un utilisateur a rejoint le canal vocal : ${newState.channel.name}`);
        await playFartSound(newState);
    }

    // Check if user changed voice channels
    if (oldState.channelId !== newState.channelId) {
        console.log(`L'utilisateur a changé de canal vocal : ${oldState.channel?.name} -> ${newState.channel?.name}`);
        await playFartSound(newState);
    }
};

async function playFartSound(state) {
    const channel = state.channel;

    if (!channel) {
        console.log('Le canal vocal n\'existe pas.');
        return;
    }

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
        const userId = state.member.user.id;

        let soundUrl = null;

        if (userId === '763495221727854672') {
            soundUrl = 'lalia.mp3'; 
        } else {
            soundUrl = await fetchRandomFartSound(); 
        }

        if (soundUrl) {
            const resource = createAudioResource(soundUrl, { inputType: 'arbitrary' });

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
        } else {
            console.error('Aucun son valide à jouer.');
        }
    } catch (error) {
        console.error(`Erreur lors de la connexion ou de la lecture : ${error.message}`);
    }
}
