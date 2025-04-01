FROM oven/bun:latest as base

# Install Chromium dependencies
RUN apt-get update \
    && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libxtst6 \
    libxkbcommon0 \
    libgtk-3-0 \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgbm1 \
    libasound2 \
    libatspi2.0-0 \
    libwebp6 \
    webp \
    && rm -rf /var/lib/apt/lists/*

# Set up the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --production

# Copy the rest of the application code
COPY src src

# Set environment variables
ENV NODE_ENV=production

# Set the entrypoint
CMD ["bun", "run", "src/index.ts"]
