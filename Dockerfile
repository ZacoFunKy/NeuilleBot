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
ENV DISCORD_TOKEN=MTI2ODE5ODcyMDEyNjcxMzg4OA.G_9QSh.a5q8uSp4VJTvt8wy3Y3lxid-gFswpy0jPxwwV4

# Start the bot
CMD ["node", "index.js"]
