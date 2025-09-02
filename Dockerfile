# Use Node.js 18 Alpine image
# Multi-stage build for Cloud Run
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install all deps (including dev) to build Vite
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install only production deps for smaller image
COPY package*.json ./
RUN npm ci --only=production
# Copy server and built assets
COPY --from=builder /app/dist ./dist
COPY src/index.js ./src/index.js

EXPOSE 8080
CMD ["node", "src/index.js"]