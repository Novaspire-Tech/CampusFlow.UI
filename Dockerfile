############################################
# Stage 1 — Build React App with Bun
############################################
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependency files first (for Docker cache)
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build Vite production bundle
RUN bun run build


############################################
# Stage 2 — Nginx Runtime
############################################
FROM nginx:1.27-alpine

RUN apk update && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]