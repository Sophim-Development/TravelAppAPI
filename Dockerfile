# Use an official Node.js runtime as a parent image
FROM node:18

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Prisma CLI globally
RUN npm install -g prisma

# Copy the Prisma schema file to the container
COPY prisma ./prisma

# Generate the Prisma client
RUN npx prisma generate

# Copy the rest of your application code to the container
COPY . .

# Expose the port your app runs on
EXPOSE 5003

# Start the application
CMD ["npm", "start"]