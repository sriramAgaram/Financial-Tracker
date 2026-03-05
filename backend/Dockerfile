# Use an official Node.js runtime as a parent image
# Slim version is used for smaller image size and better performance
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Cloud Run by default listens on port 8080
EXPOSE 8080

# Define the command to run the app
CMD [ "npm", "start" ]
