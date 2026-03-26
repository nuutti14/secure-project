# Backend Dockerfile
# Build stage (optional if no compile step is required; node_modules are installed directly in final image)
FROM node:20-alpine AS base
WORKDIR /usr/src/app

# Copy package manifests for caching
COPY package.json package-lock.json* ./

# Install deps
RUN npm ci --omit=dev

# Copy app sources
COPY . .

# The app listens on 8080 by default (adjust if different)
EXPOSE 8080

# Use environment variable for port (default 8080)
ENV PORT=8080

CMD ["node", "server.js"]
