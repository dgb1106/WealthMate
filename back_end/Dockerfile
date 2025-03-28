# Use Node.js base image
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

RUN npm install

# Copy application files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
# CMD ["npm", "run", "start:dev"]