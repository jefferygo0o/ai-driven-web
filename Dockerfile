# Use official Node.js LTS image
FROM node:20-bullseye-slim

# Install dependencies required by Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxshmfence1 \
    libasound2 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libxfixes3 \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy files
COPY package.json package-lock.json* ./
RUN npm install

# Install Playwright browsers
RUN npx playwright install --with-deps

COPY . .

# Expose API port
EXPOSE 3000

# Start the API
CMD ["node", "server.js"]
