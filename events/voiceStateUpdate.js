const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const FREESOUND_API_KEY = process.env.FREESOUND_API_KEY; // Your Freesound API key
const RANDOM_FART_SOUND_URL = `https://freesound.org/apiv2/search/text/?query=fart&fields=id&sort=downloads_desc&token=${FREESOUND_API_KEY}`;
const SOUND_DETAILS_URL = `https://freesound.org/apiv2/sounds/`; // Base URL to get sound details

async function fetchRandomFartSound() {
    try {
        const response = await axios.get(RANDOM_FART_SOUND_URL);
        const sounds = response.data.results;

        if (sounds.length === 0) {
            throw new Error('No sounds found.');
        }

        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        const soundDetailsResponse = await axios.get(`${SOUND_DETAILS_URL}${randomSound.id}/?token=${FREESOUND_API_KEY}`);
        const soundDetails = soundDetailsResponse.data;

        return soundDetails.previews['preview-hq-mp3'];
    } catch (error) {
        console.error(`Error fetching sound: ${error.message}`);
        return null;
    }
}

module.exports = async (oldState, newState) => {
    console.log(`Voice state updated: ${oldState.channelId} -> ${newState.channelId}`);

    const userJoinedChannel = oldState.channelId === null && newState.channelId !== null;
    const userChangedChannel = oldState.channelId !== newState.channelId;

    if (userJoinedChannel || userChangedChannel) {
        console.log(`User joined/changed voice channel: ${newState.channel.name}`);
        await playSoundBasedOnUser(newState);
    }
};

async function playSoundBasedOnUser(state) {
    const channel = state.channel;

    if (!channel) {
        console.log('Voice channel does not exist.');
        return;
    }

    console.log(`Attempting to connect to channel: ${channel.name}`);

    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        connection.on('error', (error) => {
            console.error(`Connection error: ${error.message}`);
        });

        const player = createAudioPlayer();
        const userId = state.member.user.id;

        let soundUrl;
        switch (userId) {
            case '763495221727854672':
                soundUrl = path.join(__dirname, '..', 'lalia.mp3');
                break;
            case '1141020730339889253':
                soundUrl = path.join(__dirname, '..', 'tokyo.mp3');
                await playAndQueueFartSound(connection, player, soundUrl);
                return;
            default:
                soundUrl = await fetchRandomFartSound();
                break;
        }

        if (soundUrl) {
            await playSound(connection, player, soundUrl);
        } else {
            console.error('No valid sound to play.');
        }
    } catch (error) {
        console.error(`Error during connection or playback: ${error.message}`);
    }
}

async function playAndQueueFartSound(connection, player, soundUrl) {
    await playSound(connection, player, soundUrl);

    const fartSoundUrl = await fetchRandomFartSound();
    if (fartSoundUrl) {
        await playSound(connection, player, fartSoundUrl);
    } else {
        console.error('No valid fart sound to play.');
    }
}

async function playSound(connection, player, soundUrl) {
    return new Promise((resolve, reject) => {
        const resource = createAudioResource(soundUrl, { inputType: 'arbitrary' });

        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Sound playback finished.');
            resolve();
        });

        player.on('error', (error) => {
            console.error(`Playback error: ${error.message}`);
            reject(error);
        });

        console.log('Connected and started playing sound.');
    });
}
