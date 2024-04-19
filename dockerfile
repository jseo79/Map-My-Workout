# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /projects

# Copy package.json and package-lock.json (if available) into the container
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Expose the port on which your application will run (if applicable)
EXPOSE 3000

# Define the command to run your application
CMD ["node", "server.js"]