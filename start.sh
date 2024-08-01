sudo docker stop discord-bot-container
sudo docker rm discord-bot-container
sudo docker build -t discord-bot .
sudo docker run -d --name discord-bot-container --env-file .env discord-bot
sudo docker logs discord-bot-container

