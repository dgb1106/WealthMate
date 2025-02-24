# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0

################################################################################
# Base Image
FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app

################################################################################
# Install Dependencies
FROM base as deps

# Copy package files first to optimize Docker caching
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

################################################################################
# Build Application
FROM base as build

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy all source files and build the app
COPY . .
RUN npm run build

################################################################################
# Final Runtime Image
FROM base as final

# Set production environment
ENV NODE_ENV=production

# Set non-root user for security
USER node

# Copy necessary files from previous stages
COPY package.json ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Expose the NestJS application port
EXPOSE 3000

# Run the application
CMD ["node", "dist/main.js"]
