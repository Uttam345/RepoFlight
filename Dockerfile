# Multi-stage build for RepoFlight services
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY services/hook-server/package.json ./services/hook-server/
COPY packages/*/package.json ./packages/*/

RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx turbo run db:generate

# Build the application
RUN npx turbo run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 repoflight

# Copy built application
COPY --from=builder --chown=repoflight:nodejs /app/dist ./dist
COPY --from=builder --chown=repoflight:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=repoflight:nodejs /app/package.json ./package.json

USER repoflight

EXPOSE 3000

ENV PORT 3000

CMD ["node", "dist/index.js"]