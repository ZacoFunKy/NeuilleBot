require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const path = require('path');

// Créer le client Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Importer les événements et commandes
const voiceStateUpdate = require('./events/voiceStateUpdate');
const playCommand = require('./commands/play');
const pingCommand = require('./commands/ping');

// Lorsque le bot est prêt
client.once('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
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



// Connexion du bot
client.login("MTI2ODE5ODcyMDEyNjcxMzg4OA.GjMpHY.VloNNLCAyZbAOQXKifSgzR4iplPcpcQI2kmDfw").catch(error => {
    console.error(`Erreur de connexion au bot : ${error.message}`);
});
