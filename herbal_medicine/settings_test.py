from pathlib import Path

from .settings import *  # noqa: F403,F401


BASE_DIR = Path(__file__).resolve().parent.parent

# Use SQLite for repeatable local CI/test runs.
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db_test.sqlite3",
    }
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
