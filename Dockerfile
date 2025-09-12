# Use Bun's official image as base
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Development stage
FROM base as development
# Install development dependencies
RUN bun install --frozen-lockfile --production=false
# Copy source code
COPY . .
# Generate Prisma client
RUN bunx prisma generate
# Expose port
EXPOSE 3000
# Start development server
CMD ["bun", "run", "dev"]

# Build stage
FROM base as build
# Copy source code
COPY . .
# Generate Prisma client
RUN bunx prisma generate
# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1 as production
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma schema for migrations
COPY prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs bunapp

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