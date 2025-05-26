# BUILD
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# PRODUCTION
FROM node:20-alpine

WORKDIR /app

# Install static file server
RUN npm install -g serve

# Copy built assets only
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
