# Development Setup

Fresh, step-by-step install of the app on a local machine for development work.
Every command assumes a Linux or macOS shell; on Windows use WSL.

If you are setting up a **production** host, use `PROD_SETUP.md` instead.

---

## 1. Prerequisites

Install these once per machine:

- **Python 3.10 or newer** (`python3 --version`)
- **Node.js 18+** and **Yarn** (`node --version`, `yarn --version`)
- **PostgreSQL 14+** running locally (`psql --version`)
- **git**

On Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-dev \
                        postgresql postgresql-contrib \
                        build-essential git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g yarn
```

> PostgreSQL is required even in dev: several core models use
> `django.contrib.postgres.fields.ArrayField`, which SQLite cannot migrate.

---

## 2. Clone the repository

```bash
git clone <repo-url> TEF
cd TEF
```

---

## 3. Create the database

This creates the user with password `password` — matches the default in
`.env.dev.example` so step 5 is a straight copy. Only OK for a local dev DB.

```bash
sudo -u postgres psql <<'EOF'
CREATE DATABASE regulatory_db;
CREATE USER regulatory_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE regulatory_db TO regulatory_user;
ALTER DATABASE regulatory_db OWNER TO regulatory_user;
EOF
```

Quick sanity check:

```bash
psql -U regulatory_user -d regulatory_db -h localhost -W -c '\q'
# Password: password. No error == success.
```

---

## 4. Python virtualenv + backend dependencies

From the repo root:

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 5. Configure environment

```bash
cp .env.dev.example .env
```

All defaults match step 3, so no edits are needed for a standard local
setup. Only change values if you chose a different Postgres password or
need a Mistral API key.

---

## 6. Apply migrations and create a superuser

With venv still activated:

```bash
python manage.py migrate
python manage.py createsuperuser
```

Follow the prompts (email, password). You'll use this account to log in to
`/admin/`.

---

## 7. Frontend dependencies

In a separate shell, from the repo root:

```bash
cd frontend
yarn install
```

---

## 8. Run the two dev servers

You need both processes running at the same time. Open two terminals.

**Terminal A — Django backend (port 8000):**

```bash
cd TEF
source venv/bin/activate
python manage.py runserver
```

**Terminal B — React dev server (port 3000):**

```bash
cd TEF/frontend
yarn start
```

The React dev server will open `http://localhost:3000` in your browser
automatically. It reads `REACT_APP_API_BASE_URL=http://localhost:8000/api`
from `frontend/.env.development`, so API calls go straight to Django.

---

## 9. Verification

With both servers running:

- [ ] `http://localhost:3000` shows the React app's landing page.
- [ ] `http://localhost:8000/admin/` shows the Django admin login; your
      superuser credentials from step 6 log you in.
- [ ] `curl -i http://localhost:8000/api/` responds (any 2xx/4xx is fine —
      a 401/404 just means auth/route, not a dead server).
- [ ] The tests run green:
      ```bash
      DJANGO_SETTINGS_MODULE=backend.settings_test \
          python -m pytest backend/core/tests/test_recommendation_engine.py
      ```

If all four pass, dev is up.

---

## Day-to-day workflow

- Pull latest: `git pull`
- New Python deps: `pip install -r requirements.txt`
- New frontend deps: `cd frontend && yarn install`
- Schema changes: `python manage.py migrate`
- Start servers: repeat step 8.

---

## Troubleshooting

- **`psycopg2` fails to build** — install `libpq-dev`:
  `sudo apt-get install libpq-dev`, then re-run `pip install -r requirements.txt`.
- **`ModuleNotFoundError: mistralai`** — `requirements.txt` includes it; make
  sure your venv is activated and you've run `pip install -r requirements.txt`.
- **`FATAL: password authentication failed for user "regulatory_user"`** —
  the password in `.env` doesn't match the one set in step 3. Either fix `.env`
  or re-set the password:
  `sudo -u postgres psql -c "ALTER USER regulatory_user WITH PASSWORD 'password';"`
- **Port 3000 / 8000 already in use** — another instance is still running.
  `lsof -i :3000` / `lsof -i :8000` to find and kill it.
- **dotenv warning "could not parse statement at line N"** — `.env` has a
  malformed line (not `KEY=VALUE`). Delete or comment it out.
