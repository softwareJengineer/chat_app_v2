# Infrastructure/Networking Setup

* Start a temporary nginx/certbot container just to download the certs for HTTPS
* Once we have those, save them to the volume and shut it down
* Then we can start the official nginx container for the rest of our routing


We should expect these environment variables when run:
* DOMAIN: "sandbox.cognibot.org" | "cognibot.org"


1. `certbot-init` runs, downloads the certificates to the volume, and shuts down
2. `nginx` runs and is able to access those certificates

