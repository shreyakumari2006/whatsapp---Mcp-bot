# ==========================================================
# Multi-Stage Dockerfile for WhatsApp MCP Server & Dashboard
# ==========================================================

# --- Stage 1: Build React Frontend ---
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend & MCP Widgets ---
FROM node:22-slim AS backend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/widgets/package*.json ./src/widgets/
RUN cd src/widgets && npm ci

COPY . .
RUN npm run build

# --- Stage 3: Production Runtime ---
FROM node:22-slim AS runtime
WORKDIR /app

# Install headless Chromium and required system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    libgbm-dev \
    libnss3 \
    libasound2t64 \
    libxss1 \
    libxtst6 \
    libxshmfence1 \
    libglu1 \
    fonts-liberation \
    ca-certificates \
    procps \
    dumb-init \
  || apt-get install -y --no-install-recommends \
    chromium \
    libgbm-dev \
    libnss3 \
    libasound2 \
    libxss1 \
    libxtst6 \
    libxshmfence1 \
    fonts-liberation \
    ca-certificates \
    procps \
    dumb-init \
  && rm -rf /var/lib/apt/lists/*

# Configure Chromium environment variables for Puppeteer / whatsapp-web.js
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=3000

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend output, widget assets, and frontend dist
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/src/widgets/out ./src/widgets/out
COPY --from=backend-builder /app/src/api/dashboard.html ./src/api/dashboard.html
COPY --from=frontend-builder /app/frontend/dist ./public

# Ensure directories for WhatsApp session persistence exist
RUN mkdir -p /app/.wwebjs_auth /app/.wwebjs_cache

EXPOSE 3000 3001

# Use dumb-init to handle PID 1 zombie processes spawned by headless Chromium
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/index.js"]
