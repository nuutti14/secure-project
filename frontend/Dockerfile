# Frontend Dockerfile (Vite React)
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_APP_CAPTCHA_SITE_KEY
ENV VITE_APP_CAPTCHA_SITE_KEY=$VITE_APP_CAPTCHA_SITE_KEY

# Copy source and build
COPY . .
RUN npm run build

# Production nginx stage
FROM nginx:stable-alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html



RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

# Optional: provide environment variable fallback
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
