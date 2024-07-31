# Use the official Node.js image as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the bot's dependencies
RUN npm install

# Copy the rest of the bot's code to the working directory
COPY . .

# Expose any ports the bot might need (optional, not needed for a Discord bot)
# EXPOSE 3000

# Set environment variables
ENV DISCORD_TOKEN=your-bot-token-here

# Start the bot
CMD ["node", "index.js"]
