require('dotenv').config();
const { Client, GatewayIntentBits, Presence} = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { targetUserId, monitoredUserId } = require('./config.json');
const path = require('path');
const moment = require('moment-timezone');

// Créer le client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
    ],
});

// Importer les événements et commandes
const voiceStateUpdate = require('./events/voiceStateUpdate');
const playCommand = require('./commands/play');
const pingCommand = require('./commands/ping');

// Lorsque le bot est prêt
client.once('ready', () => {
    const currentTime = moment.tz(Date.now(), "Europe/Paris");
    const adjustedTime = currentTime.clone().add(2, 'hours');
    console.log(`Connecté en tant que ${client.user.tag}, il est ${msToTime(adjustedTime)}.`);
});

// Événements de mise à jour de l'état vocal
client.on('voiceStateUpdate', voiceStateUpdate);

// Commandes
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignore messages from bots

    console.log(`Received message: ${message.content}`); // Debug log
    console.log(`Channel ID: ${message.channel.id}`); // Debug log

    const prefix = '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(`Command received: ${command}`); // Debug log

    if (command === 'ping') {
        pingCommand(message);
    }
});

// Gestion des interactions
const userConnectionTimes = new Map();

// Surveillance des présences
client.on('presenceUpdate', async (oldPresence, newPresence) => {
    const monitoredUser = monitoredUserId;

    if (newPresence.userId === monitoredUser) {
        const currentTime = moment.tz(Date.now(), "Europe/Paris");

        // Vérifiez si l'utilisateur est en ligne
        if (!oldPresence || oldPresence.status === 'offline' && newPresence.status === 'online') {
            // L'utilisateur surveillé s'est connecté
            const user = await client.users.fetch(targetUserId);
            const adjustedTime = currentTime.clone().add(2, 'hours');
            await user.send(`<@${monitoredUser}> s'est connecté. Il y maintenant ${msToTime(adjustedTime)}.`);
            userConnectionTimes.set(monitoredUser, currentTime);
        } else if (oldPresence && oldPresence.status !== 'offline' && newPresence.status === 'offline') {
            // L'utilisateur surveillé s'est déconnecté
            if (userConnectionTimes.has(monitoredUser)) {
                const connectionTime = userConnectionTimes.get(monitoredUser);
                const timeDifference = currentTime - connectionTime;
                const user = await client.users.fetch(targetUserId);
                await user.send(`<@${monitoredUser}> s'est déconnecté. Temps total en ligne : ${msToTime(timeDifference)}.`);

                // Effacer le temps de connexion de la carte
                userConnectionTimes.delete(monitoredUser);
            }
        }
    }
});

// Fonction pour convertir le temps en millisecondes en format 'jours heures minutes secondes'
function msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return `${hours}h ${minutes}m ${seconds}s`;
}


// Connexion du bot
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error(`Erreur de connexion au bot : ${error.message}`);
});
