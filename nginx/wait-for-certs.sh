#!/bin/sh
set -e

CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

echo "Waiting for $CERT_PATH ..."

while [ ! -f "$CERT_PATH" ]; do
  sleep 2
done

echo "cert found, starting nginx"
exec nginx -g "daemon off;"