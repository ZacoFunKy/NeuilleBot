#!/bin/bash

# Description: This script is used to build and run the docker container for the discord bot.

# Stop the existing discord bot container
sudo docker stop discord-bot-container

# Remove the existing discord bot container
sudo docker rm discord-bot-container

# Build the docker image for the discord bot
sudo docker build -t discord-bot .

# Run the discord bot container with the specified environment file
sudo docker run -d --name discord-bot-container --env-file .env discord-bot

# Display the logs of the discord bot container
echo "Displaying the logs of the discord bot container..."
sleep 5
sudo docker logs discord-bot-container
