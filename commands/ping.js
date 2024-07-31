module.exports = (message) => {
    message.reply(`Pong! Latency: ${Date.now() - message.createdTimestamp}ms`);
};
