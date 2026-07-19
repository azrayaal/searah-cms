# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app

# Vite inlines VITE_* at build time, so these must be build args rather than
# runtime env — a container started with a different VITE_API_URL would ignore it.
ARG VITE_API_URL
ARG VITE_LANDING_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_LANDING_URL=$VITE_LANDING_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
