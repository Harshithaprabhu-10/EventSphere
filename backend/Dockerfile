FROM node:20-alpine

WORKDIR /app

# Copy only package files first so npm install is cached
# separately from source code changes (faster rebuilds).
COPY package*.json ./

RUN npm install --omit=dev

# Now copy the rest of the application source.
COPY . .

EXPOSE 5000

# Run as a non-root user for better container security.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "src/server.js"]