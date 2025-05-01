# Use an official Node.js runtime as a parent image
FROM node:18

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client

# Set the working directory in the container
WORKDIR /app

# Set build arguments
ARG PORT=5003
ARG NODE_ENV=production

# Set environment variables
ENV PORT=$PORT
ENV NODE_ENV=$NODE_ENV

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Prisma CLI globally
RUN npm install -g prisma

# Copy the Prisma schema file to the container
COPY prisma ./prisma

# Reset the database
RUN npx prisma migrate reset --force --skip-seed

# Generate the Prisma client
RUN npx prisma generate

# Migrate the database
RUN npx prisma migrate deploy

# Copy the .env file to the container
# COPY .env ./

# Copy the rest of your application code to the container
COPY . .

# Create a directory for secrets
RUN mkdir -p /run/secrets

# Expose the port your app runs on
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
