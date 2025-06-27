# BUILD
FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# PRODUCTION
FROM oven/bun:latest

WORKDIR /app

# Install static file server
RUN bun install -g serve

# Copy built assets only
COPY --from=builder /app/dist ./dist

# Copy entrypoint script to inject `.env`
COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
