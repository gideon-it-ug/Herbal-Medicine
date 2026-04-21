# Production Environment Checklist

## 1) Required Environment Variables

- `DJANGO_DEBUG=false`
- `DJANGO_SECRET_KEY=<strong-random-secret>`
- `DJANGO_ALLOWED_HOSTS=<comma-separated-hosts>`
- `DB_ENGINE=django.db.backends.postgresql`
- `DB_NAME=<postgres-db-name>`
- `DB_USER=<postgres-user>`
- `DB_PASSWORD=<postgres-password>`
- `DB_HOST=<postgres-host>`
- `DB_PORT=<postgres-port>`
- `CORS_ALLOWED_ORIGINS=<comma-separated-https-origins>`
- `CSRF_TRUSTED_ORIGINS=<comma-separated-https-origins>`

## 2) Security Settings Verification

- SSL termination is configured at reverse proxy/load balancer.
- `SECURE_SSL_REDIRECT=true` in production.
- `SESSION_COOKIE_SECURE=true` and `CSRF_COOKIE_SECURE=true`.
- HSTS enabled (`SECURE_HSTS_SECONDS >= 31536000`) after HTTPS validation.
- `CORS_ALLOW_ALL_ORIGINS=false` in production.

## 3) Database and Migrations

- Backup database before deploy.
- Run:
  - `python manage.py makemigrations --check --dry-run`
  - `python manage.py migrate`
- Verify `transcription` migration `0003_update_transcription_processing_fields` applied.

## 4) Static/Media and Runtime

- Configure media persistence for `MEDIA_ROOT`.
- Ensure log capture is enabled (application and web server logs).
- Confirm process manager is configured (systemd/gunicorn/uvicorn equivalent).

## 5) API Smoke Tests (Post-Deploy)

- Obtain token: `POST /api/token/`
- List plants: `GET /api/plants/`
- Search plants: `GET /api/plants/?search=<term>`
- Chatbot: `POST /api/nlp/chat/`
- Auth flow: create transcription `POST /api/transcriptions/` with JWT.

## 6) Web and Mobile E2E

- Login from web and mobile.
- Upload sample audio and confirm transcription completes.
- Run NLP extraction and save a plant.
- Verify plant appears in search/list/detail.
- Ask chatbot about the saved plant/ailment.
