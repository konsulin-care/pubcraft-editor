
# Use Node.js 18 Alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Use `npx serve` to serve static files
RUN npm install -g serve

# Expose port
EXPOSE 8080

# Start the application
CMD ["serve", "-s", "dist", "-l", "8080"]
