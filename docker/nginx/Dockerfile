FROM node:22-alpine AS frontend-build

WORKDIR /app

ARG API_URL=http://api.pokechess.local/api
ENV API_URL=${API_URL}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

RUN node scripts/set-production-env.cjs && npm run build

FROM nginx:1.27-alpine

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/conf.d/ /etc/nginx/conf.d/

COPY --from=frontend-build /app/dist/frontend/browser /var/www/frontend/browser

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ -O /dev/null || exit 1
