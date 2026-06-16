FROM node:22-alpine AS builder

WORKDIR /app

ARG API_URL=http://api.app.local/api
ENV API_URL=${API_URL}

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

RUN node scripts/set-production-env.cjs && npm run build

# Imagen de artefactos: dist listo para copiar a Nginx
FROM scratch AS export
COPY --from=builder /app/dist/frontend/browser /dist
