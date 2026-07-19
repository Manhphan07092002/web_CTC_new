# ─────────────────────────────────────────────
# Stage 1: Build React frontend (Vite)
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install ALL deps (dev included for build)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend (tsc + vite build → dist/)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production runtime
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server source and other necessary files
COPY server ./server
COPY services ./services
COPY models ./models
COPY types ./types
COPY types.ts ./types.ts
COPY tsconfig.json ./tsconfig.json
COPY locales ./locales
COPY constants ./constants



# Create uploads directory (for persistent volume mount)
RUN mkdir -p uploads

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:4000/ || exit 1

# Start the Express server (serves both API + static dist/)
CMD ["node", "--import", "tsx", "server/index.ts"]
