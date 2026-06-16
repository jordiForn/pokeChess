# Base oficial ISC: Alpine Linux (bind9 ya incluido en la imagen)
FROM internetsystemsconsortium/bind9:9.18

USER root

# bind-tools = dig/nslookup (equivalente Alpine de dnsutils en Debian)
RUN apk add --no-cache bind-tools

COPY named.conf /etc/bind/named.conf
COPY named.conf.local /etc/bind/named.conf.local
COPY named.conf.options /etc/bind/named.conf.options

RUN mkdir -p /etc/bind/zones && chown -R bind:bind /etc/bind
