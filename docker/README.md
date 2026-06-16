# PokeChess — Infraestructura Docker (Fase 3)

Stack local con Docker Compose: **Angular 21**, **Laravel (PHP-FPM)**, **Nginx**, **MariaDB**, **phpMyAdmin** y **Bind9**.

## Red e IPs fijas (`10.1.0.0/24`)

| Servicio    | Contenedor           | IP        | Puerto host |
|-------------|----------------------|-----------|-------------|
| Bind9 (DNS) | `pokechess-dns`      | 10.1.0.2  | 53/udp,tcp  |
| Nginx       | `pokechess-nginx`    | 10.1.0.3  | 80          |
| PHP-FPM     | `pokechess-php-fpm`  | 10.1.0.4  | —           |
| MariaDB     | `pokechess-mariadb`  | 10.1.0.5  | —           |
| phpMyAdmin  | `pokechess-phpmyadmin` | 10.1.0.6 | —         |

## Dominios (zona `app.local`)

| Dominio          | Destino              |
|------------------|----------------------|
| `app.local`      | Angular (Nginx)      |
| `api.app.local`  | Laravel API (Nginx → PHP-FPM) |
| `db.app.local`   | phpMyAdmin (Nginx proxy) |

Registros DNS apuntan a **10.1.0.3** (Nginx).

---

## Comandos en Ubuntu limpio

### 1. Dependencias

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg dnsutils

# Docker Engine + Compose plugin
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
newgrp docker
```

### 2. Liberar puerto 53 (conflicto con systemd-resolved)

```bash
sudo systemctl disable --now systemd-resolved
sudo rm -f /etc/resolv.conf
echo "nameserver 127.0.0.1" | sudo tee /etc/resolv.conf
echo "options edns0 trust-ad" | sudo tee -a /etc/resolv.conf
```

### 3. Clonar y configurar

```bash
cd /ruta/a/pokeChess
cp .env.docker.example .env.docker
```

Edita `.env.docker` si necesitas cambiar contraseñas.

### 4. Levantar el stack

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps
docker compose logs -f
```

El entrypoint de PHP-FPM ejecuta `composer install`, `migrate` y `db:seed` en el primer arranque.

### 5. Verificar DNS desde el host

```bash
dig @127.0.0.1 app.local +short
dig @127.0.0.1 api.app.local +short
dig @127.0.0.1 db.app.local +short
# Deben devolver: 10.1.0.3
```

### 6. Verificar servicios HTTP

```bash
curl -H 'Host: api.app.local' http://127.0.0.1/up
curl -H 'Host: api.app.local' http://127.0.0.1/api/v1/pieces
curl -H 'Host: app.local' http://127.0.0.1/ | head
curl -H 'Host: db.app.local' http://127.0.0.1/ | head
```

O en el navegador (con DNS en 127.0.0.1):

- http://app.local
- http://api.app.local/up
- http://db.app.local

### 7. Script de validación completa

```bash
chmod +x docker/scripts/validate.sh
./docker/scripts/validate.sh
```

---

## Credenciales por defecto (seed)

| Usuario                 | Contraseña |
|-------------------------|------------|
| admin@pokechess.test    | password   |
| user@pokechess.test     | password   |

MariaDB: usuario `pokechess` / `pokechess_secret` (ver `.env.docker`).

---

## Estructura de archivos Docker

```
docker-compose.yml
.env.docker.example
.dockerignore
docker/
├── bind9/          # Bind9 + zona app.local
├── frontend/       # Dockerfile build Angular 21
├── nginx/          # Dockerfile Nginx + vhosts
├── php-fpm/        # Dockerfile PHP-FPM + entrypoint Laravel
└── scripts/        # validate.sh
```

---

## Comandos útiles

```bash
# Rebuild solo frontend/nginx tras cambios Angular
docker compose build nginx && docker compose up -d nginx

# Logs por servicio
docker compose logs -f php-fpm
docker compose logs -f nginx
docker compose logs -f dns

# Parar y eliminar contenedores (conserva volumen MariaDB)
docker compose down

# Parar y borrar datos de BD
docker compose down -v
```

---

## Notas

- El `backend/Dockerfile` de Railway **no se modifica**; la imagen local usa `docker/php-fpm/Dockerfile`.
- Angular se compila en build de Nginx con `API_URL=http://api.app.local/api`.
- Laravel se monta desde `./backend` para desarrollo; `storage` y `bootstrap/cache` usan volúmenes nombrados.
