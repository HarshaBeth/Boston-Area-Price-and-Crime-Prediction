FROM node:20-alpine

WORKDIR /app

# Ensure dependencies work well on Alpine
RUN apk add --no-cache libc6-compat

# Default to development for hot reload and readable component names
ENV NODE_ENV=development \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true \
    HOST=0.0.0.0 \
    PORT=3000

# Install dependencies separately for better build caching
COPY package*.json ./
RUN npm ci

EXPOSE 3000

# Use Next.js dev server so the container picks up file changes
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
