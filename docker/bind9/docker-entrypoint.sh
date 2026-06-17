#!/bin/sh
set -e

echo "[dns] Validando configuración Bind9..."
named-checkconf /etc/bind/named.conf
named-checkzone pokechess.local /etc/bind/zones/db.pokechess.local

echo "[dns] Iniciando named (puerto 53 TCP/UDP)..."
exec /usr/sbin/named -u bind -f -c /etc/bind/named.conf -L /var/log/bind/default.log
