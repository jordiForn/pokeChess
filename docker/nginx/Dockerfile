FROM node:22-alpine AS frontend-build

WORKDIR /app

ARG API_URL=/api
ENV API_URL=${API_URL}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

RUN node scripts/set-production-env.cjs && npm run build

FROM nginx:1.27-alpine

COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/ssl/ssl-params.conf /nginx/ssl/ssl-params.conf
COPY docker/nginx/conf.d/ /etc/nginx/conf.d/

RUN mkdir -p /nginx/ssl

COPY --from=frontend-build /app/dist/frontend/browser /var/www/frontend/browser

EXPOSE 80 443
