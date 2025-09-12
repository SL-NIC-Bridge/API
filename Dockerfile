FROM oven/bun:1

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client and build
RUN bun prisma generate && bun run build

# Create directories
RUN mkdir -p uploads logs

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs bunapp

# Change ownership of app directory
RUN chown -R bunapp:nodejs /app

USER bunapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start production server
CMD ["bun", "run", "start"]