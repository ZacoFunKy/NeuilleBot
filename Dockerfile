# Use the official Node.js image as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install the Node.js dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Copy the .env file into the container
COPY .env .env

# Expose the port that the application runs on (optional, adjust as needed)
# EXPOSE 3000

# Command to run the application
CMD ["node", "index.js"]
