# Production Setup

Full production install of the app behind nginx, with gunicorn + systemd and
Postgres. Designed to run on Ubuntu 22.04.

If you are only setting up a local development environment, use
`DEV_SETUP.md` instead.

This guide uses placeholder values you must replace:

- `<DOMAIN>` — e.g. `regulatory.example.com`
- `<USER>` — the Linux user the app runs as (e.g. `morinf`)
- `<DB_PASSWORD>` — a strong, unique password
- `<SECRET_KEY>` — a freshly generated Django secret key (step 6)
- `<INSTALL_DIR>` — where you clone the repo (default: `/home/<USER>/regulatory_system`)
- `<NGINX_PORT>` — the port nginx listens on (default: `80`, or `8080` when
  co-existing with another service on the same host)
- `<GUNICORN_PORT>` — the port gunicorn listens on behind nginx
  (default: `8000`, or `8001` when co-existing with a dev server on 8000)

---

## 1. Prerequisites

```bash
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y build-essential git curl \
                        python3 python3-venv python3-dev \
                        postgresql postgresql-contrib \
                        nginx
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g yarn
```

Verify:

```bash
python3 --version    # 3.10+
node --version       # v18+
yarn --version
psql --version       # 14+
nginx -v
```

---

## 2. Create the database

```bash
sudo -u postgres psql <<EOF
CREATE DATABASE regulatory_db;
CREATE USER regulatory_user WITH PASSWORD '<DB_PASSWORD>';
GRANT ALL PRIVILEGES ON DATABASE regulatory_db TO regulatory_user;
ALTER DATABASE regulatory_db OWNER TO regulatory_user;
EOF
```

Check connection:

```bash
psql -U regulatory_user -d regulatory_db -h localhost -W -c '\q'
```

---

## 3. Clone the repo

```bash
cd /home/<USER>
git clone <repo-url> regulatory_system
cd regulatory_system
```

---

## 4. Python virtualenv + dependencies (including gunicorn)

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

---

## 5. Build the frontend bundle

```bash
cd frontend
yarn install
yarn build
cd ..
```

`frontend/.env.production` is already committed with
`REACT_APP_API_BASE_URL=/api`, so the bundle hits the backend through
nginx on the same origin.

---

## 6. Configure `.env`

```bash
cp .env.prod.example .env
```

Generate a fresh Django secret key:

```bash
source venv/bin/activate
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Edit `.env` and set:

- `DJANGO_SECRET_KEY` — the value from the command above
- `DJANGO_ALLOWED_HOSTS` — `<DOMAIN>` (comma-separated if multiple)
- `DJANGO_CSRF_TRUSTED_ORIGINS` — `https://<DOMAIN>` (use `http://` until SSL
  is set up; then switch)
- `DB_PASSWORD` — the password from step 2
- `MISTRAL_API_KEY` — your Mistral API key (or leave blank if unused)

Leave `DJANGO_DEBUG=0` and `DJANGO_BEHIND_PROXY=1` as-is.

> **No TLS?** If the host has no HTTPS listener (internal-only network,
> or the coexistence rehearsal below), also set
> `DJANGO_SECURE_SSL_REDIRECT=0` — otherwise Django 301-redirects every
> request to `https://…` and nothing works. Real prod with nginx +
> certbot (step 12) must keep it at `1`.

Lock down the file:

```bash
chmod 600 .env
```

---

## 7. Migrate and collect static files

```bash
source venv/bin/activate
python manage.py migrate
python manage.py createsuperuser   # interactive — pick an admin email/password
python manage.py collectstatic --noinput
```

---

## 8. Deploy the frontend bundle to `/var/www`

nginx is not permitted to traverse `/home/<USER>/...`, so serve the React
build from a standard web directory instead.

```bash
sudo mkdir -p /var/www/regulatory_frontend
sudo rsync -a --delete \
    /home/<USER>/regulatory_system/frontend/build/ \
    /var/www/regulatory_frontend/
```

Merge Django's admin static files into the same directory so both
React and Django share nginx's single `/static/` path. Without this,
the React bundle's `/static/js/…` and `/static/css/…` 404 because
they collide with Django's admin assets:

```bash
sudo rsync -a \
    /home/<USER>/regulatory_system/staticfiles/admin/ \
    /var/www/regulatory_frontend/static/admin/
```

Lock down permissions:

```bash
sudo chown -R root:root /var/www/regulatory_frontend
sudo find /var/www/regulatory_frontend -type d -exec chmod 755 {} \;
sudo find /var/www/regulatory_frontend -type f -exec chmod 644 {} \;
```

Repeat the frontend rsync whenever you rebuild the frontend. Repeat the
admin rsync whenever Django's static output changes (rare: after `pip
upgrade` of Django or a theme change).

---

## 9. nginx

Two-step install: edit the template in the repo, then `sudo install` it
into place. Pasting multi-line heredocs straight into a terminal is
fragile (auto-indenting terminals mangle the closing delimiter).

Edit `Guides/templates/regulatory_system.nginx.conf`:
- `listen 80;` → `listen <NGINX_PORT>;` if non-default
- `server_name your-domain.example.com;` → `<DOMAIN>`
- `proxy_pass http://127.0.0.1:8000;` → port = `<GUNICORN_PORT>` (both
  occurrences)

Then:

```bash
sudo install -m 644 -o root -g root \
    Guides/templates/regulatory_system.nginx.conf \
    /etc/nginx/sites-available/regulatory_system
sudo ln -sf /etc/nginx/sites-available/regulatory_system \
            /etc/nginx/sites-enabled/regulatory_system
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` should print `syntax is ok` and `test is successful`. The
template does **not** include a `location /static/` block — step 8's
admin rsync makes that unnecessary and avoids a path collision with
the React build's own `/static/js/…` and `/static/css/…` paths.

---

## 10. systemd service for the backend

Same template-install pattern. Edit
`Guides/templates/regulatory-backend.service`:
- Every `your-linux-user` → `<USER>`
- `--bind 127.0.0.1:8000` → `<GUNICORN_PORT>` if non-default

Then:

```bash
sudo install -m 644 -o root -g root \
    Guides/templates/regulatory-backend.service \
    /etc/systemd/system/regulatory-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now regulatory-backend
sudo systemctl status regulatory-backend --no-pager
```

Expected: `Active: active (running)` and a "Gunicorn arbiter booted"
line.

---

## 11. Firewall (if the host is internet-facing)

```bash
sudo ufw allow 22/tcp
sudo ufw allow <NGINX_PORT>/tcp
sudo ufw allow 443/tcp    # later, for SSL
sudo ufw enable
sudo ufw status
```

---

## 12. HTTPS (recommended, internet-facing hosts only)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <DOMAIN>
sudo certbot renew --dry-run
```

After certbot rewrites the nginx config, switch
`DJANGO_CSRF_TRUSTED_ORIGINS` in `.env` to `https://<DOMAIN>` and restart:

```bash
sudo systemctl restart regulatory-backend
```

---

## 13. Verification

- [ ] `sudo systemctl status regulatory-backend` shows `active (running)`.
- [ ] `sudo systemctl status nginx` shows `active (running)`.
- [ ] `curl -i http://127.0.0.1:<GUNICORN_PORT>/api/` responds (any 2xx/4xx;
      5xx means the backend is broken).
- [ ] `curl -I http://127.0.0.1:<NGINX_PORT>/` returns `200 OK` (the React
      bundle loads).
- [ ] Open `http://<DOMAIN>/` in a browser: React landing page appears.
- [ ] Open `http://<DOMAIN>/admin/` and log in with the superuser from step 7.
- [ ] Admin pages render with their CSS (if not → `/static/` alias issue,
      see the note under step 9).

---

## Updates after first deploy

```bash
cd /home/<USER>/regulatory_system
git pull
source venv/bin/activate
pip install -r requirements.txt             # if deps changed
python manage.py migrate                    # if schema changed
python manage.py collectstatic --noinput
cd frontend && yarn install && yarn build && cd ..
sudo rsync -a --delete frontend/build/ /var/www/regulatory_frontend/
sudo systemctl restart regulatory-backend
```

---

## Running dev and prod side-by-side on one host

Useful when you want to test this guide without a second machine, or to
reproduce a prod-only bug on your dev box. Two installs coexist by
diverging on every piece of shared state:

| Piece of state | Dev default | Prod-on-same-host override |
|---|---|---|
| Install dir | `<any>` | `/home/<USER>/code/rehearsal/prod` (or wherever) |
| DB name / user | `regulatory_db` / `regulatory_user` | `regulatory_db_prod` / `regulatory_user_prod` |
| `DB_NAME`, `DB_USER` in `.env` | matches dev | `regulatory_db_prod`, `regulatory_user_prod` |
| Gunicorn port | (none — `runserver` uses 8000) | `8001` |
| Nginx port | (none) | `8080` |
| Nginx site name | — | `regulatory_system_rehearsal` |
| Systemd unit | — | `regulatory-backend-rehearsal` |
| Web root | — | `/var/www/regulatory_frontend_rehearsal` |
| `DJANGO_SECURE_SSL_REDIRECT` | n/a | `0` (no TLS locally) |

Don't delete nginx's default site (its port 80 doesn't clash with 8080),
don't touch the firewall, and skip the certbot step. Everything else in
the guide works as-is once you substitute the values above.

---

## Troubleshooting

- **`regulatory-backend` fails to start** — `sudo journalctl -u regulatory-backend -n 100 --no-pager`. Usually a missing env var or bad DB password.
- **502 Bad Gateway from nginx** — gunicorn is down or on the wrong port.
  `sudo systemctl status regulatory-backend` and check the `--bind` port
  in the service file matches `proxy_pass` in nginx.
- **403 / 500 at `/`** — nginx can't read `/var/www/regulatory_frontend/`.
  Check `sudo nginx -t` and `sudo tail -f /var/log/nginx/error.log`.
- **Admin CSS missing** — step 8's admin-static rsync didn't run, or
  wasn't re-run after the React rebuild (which `rsync --delete`s the
  whole tree). Re-run both rsyncs from step 8.
- **React app serves a blank page; `/static/js/main.*.js` returns 404** —
  the nginx config has an old `location /static/ { alias …; }` block
  that shadows the React build's assets. Use the template from
  `Guides/templates/regulatory_system.nginx.conf` (no `/static/` alias)
  and re-run step 8's admin-static rsync.
- **Everything 301-redirects to `https://…`** — `DJANGO_SECURE_SSL_REDIRECT=1`
  but there's no TLS on the host. Either set it to `0` in `.env`
  (internal/rehearsal hosts) or finish step 12 (certbot) for a real
  certificate.
- **CSRF errors on login** — `DJANGO_CSRF_TRUSTED_ORIGINS` doesn't match
  the scheme+host the browser uses. Update `.env` and restart the backend.
