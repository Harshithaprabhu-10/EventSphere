# ---- Stage 1: Build ----
# Use Node to compile the React app into static HTML/CSS/JS files.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite needs the API URL at build time, not runtime,
# because it bakes VITE_* variables into the compiled JS bundle.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Stage 2: Serve ----
# Throw away Node entirely. Only copy the compiled output
# into a minimal Nginx image that serves static files.
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Replace Nginx's default config with ours (handles React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]