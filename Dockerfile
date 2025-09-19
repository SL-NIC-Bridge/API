FROM oven/bun:1

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and Prisma schema first
COPY package.json bun.lockb* ./
COPY prisma ./prisma

# Install dependencies (this will now find the schema and generate Prisma client)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Create directories
RUN mkdir -p uploads logs

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bunapp

# Change ownership of app directory
RUN chown -R bunapp:nodejs /app

USER bunapp

# Expose port
EXPOSE 3088

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3088/api/v1/health || exit 1

# Start production server
CMD ["bun", "run", "start"]