# Stage 1: Build app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the source code
COPY . .

# Build the NestJS app
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy only production deps
COPY package*.json ./
RUN npm install --only=production

# Copy built files and generated Prisma client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Set env var so Prisma knows where schema is (for runtime)
ENV PRISMA_SCHEMA_PATH=./prisma/schema.prisma
ENV HOST=0.0.0.0

# Optional: expose port (Cloud Run auto detects)
EXPOSE 8080

# Start the app
CMD ["node", "dist/main"]
