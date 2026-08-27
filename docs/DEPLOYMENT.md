# Hosting the study builder on MT Group's own server

MT Group controls DNS for `mtgroupbio.com` and runs nginx with PHP. That is
enough — nginx sits in front of the quote builder, the PHP site is untouched,
and nothing moves to a third party.

Written for whoever administers the web server.

## The shape of it

The quote builder is a Node application, not PHP, so it cannot be dropped into
a folder alongside the existing site. It runs as its own service on a local
port, and nginx forwards traffic to it:

    studybuilderbd.mtgroupbio.com  →  nginx (443, TLS)  →  127.0.0.1:3000  →  Next.js
    www.mtgroupbio.com     →  nginx (443, TLS)  →  PHP-FPM  (unchanged)

One nginx server block, one systemd service, one DNS record. The existing site's
configuration is not modified.

## What the server needs

| | |
|---|---|
| **Node.js** | 20 or newer (built and tested on 22). |
| **A process manager** | systemd is already there; no need for pm2. |
| **Outbound HTTPS** | to Neon (the database) and to HubSpot's API. |
| **Nothing else** | no PHP changes, no new database on the box — Neon is hosted. |

If Node is not installed, install from NodeSource or `nvm`; it does not conflict
with PHP.

## DNS

One record, pointing the subdomain at the same server that already serves the
site:

    studybuilderbd  A    <the server's public IP>

`www` and `studybuilderbd` can share one IP; nginx tells them apart by hostname.

## nginx

A separate server block, so the existing site's config is never edited:

```nginx
server {
    listen 443 ssl http2;
    server_name studybuilderbd.mtgroupbio.com;

    ssl_certificate     /etc/letsencrypt/live/studybuilderbd.mtgroupbio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studybuilderbd.mtgroupbio.com/privkey.pem;

    # Word documents are generated on the fly and can take a moment.
    proxy_read_timeout 120s;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name studybuilderbd.mtgroupbio.com;
    return 301 https://$host$request_uri;
}
```

Certificate: `certbot --nginx -d studybuilderbd.mtgroupbio.com`. It renews itself.

## Running the app

```ini
# /etc/systemd/system/studybuilder.service
[Unit]
Description=MT Group Study Builder
After=network.target

[Service]
Type=simple
User=studybuilder
WorkingDirectory=/srv/studybuilder
EnvironmentFile=/etc/studybuilder.env
ExecStart=/usr/bin/node node_modules/.bin/next start -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Deploying a new version:

```bash
cd /srv/studybuilder
git pull
npm ci                 # runs prisma generate via postinstall
npm run db:deploy      # applies any new migrations
npm run build
sudo systemctl restart studybuilder
```

## Secrets

`/etc/studybuilder.env`, owned by root, mode `600` — never in the repository:

    DATABASE_URL=postgresql://...-pooler...   # pooled, for the app
    DIRECT_URL=postgresql://...               # unpooled, for migrations only
    HUBSPOT_TOKEN=pat-na1-...                 # the read-only service key

Two database URLs is not a mistake. Migrations against a transaction-mode pooler
fail on lock acquisition, sometimes only under load, so `prisma7.config.ts`
prefers `DIRECT_URL`.

## Before it goes live

**The app has no authentication yet.** A subdomain is not private — they get
found and guessed — and the internal draft carries pricing notes, margins and
site costs. Login goes in before the DNS record does, not after.

## The alternative, for the record

Vercel would host it with a DNS record and no server administration at all, and
is free at this scale. Self-hosting is still the better fit here: MT Group
already runs the infrastructure, the data is commercially sensitive, and there
is no third party to add to a security review. Worth revisiting only if keeping
Node patched on that box turns out to be a chore.
