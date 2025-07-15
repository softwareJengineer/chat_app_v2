FROM nginx:1.27-alpine

# Remove the default site just to make sure it doesn't interfere
RUN rm /etc/nginx/conf.d/default.conf

# Copy the minimal, port 80-only host file
COPY init.conf /etc/nginx/templates/default.template

# Install certbot
RUN apk add --no-cache certbot

# Entry: start nginx => run certbot => shutdown
ENTRYPOINT ["/bin/sh","-c"]
CMD ["nginx && certbot certonly --webroot --webroot-path /var/www/certbot \
      --email $CERT_EMAIL \
      --agree-tos --non-interactive \
      -d $DOMAIN -d $DOMAIN_WWW && \
  nginx -s quit"]
