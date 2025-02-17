# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY . .

# Create uploads directory
RUN mkdir -p uploads && chown -R node:node uploads

# Create volume for uploads
VOLUME /app/uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1
