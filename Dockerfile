# Base image with Node.js
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Run the app in production mode
CMD ["node", "dist/main"]
