FROM internetsystemsconsortium/bind9:9.18

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends dnsutils \
    && rm -rf /var/lib/apt/lists/*

COPY named.conf /etc/bind/named.conf
COPY named.conf.local /etc/bind/named.conf.local
COPY named.conf.options /etc/bind/named.conf.options

RUN mkdir -p /etc/bind/zones && chown -R bind:bind /etc/bind
