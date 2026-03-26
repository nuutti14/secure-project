# Frontend Dockerfile (Vite React)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install deps
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production nginx stage
FROM nginx:stable-alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Optional: provide environment variable fallback
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
