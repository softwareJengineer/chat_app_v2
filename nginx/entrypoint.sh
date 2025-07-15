#!/usr/bin/env bash
set -euo pipefail

# Render template
envsubst '${DOMAIN} ${DOMAIN_WWW}' \
  < /etc/nginx/templates/default.template \
  > /etc/nginx/conf.d/default.conf

# First-run: obtain cert if missing
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    certbot --non-interactive --nginx --agree-tos \
        -d "${DOMAIN}" -d "${DOMAIN_WWW}" \
        --email "${CERT_EMAIL}"
fi

# Cron for renewals
echo "0 3 * * * certbot renew --quiet --post-hook 'nginx -s reload'" | crontab -
crond

# Exec nginx in foreground
exec nginx -g "daemon off;"
