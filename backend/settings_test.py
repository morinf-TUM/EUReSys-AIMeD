"""
Test settings: inherit from settings.py and swap Postgres for in-memory SQLite.

Scope: suitable only for tests that do NOT touch the ORM (e.g. plain
unittest.TestCase or django.test.SimpleTestCase tests of pure-Python
logic like backend.core.recommendation_engine).

Tests that hit the database must run against a real Postgres server,
because several core models use django.contrib.postgres.fields.ArrayField,
which SQLite cannot migrate (CREATE TABLE fails with a syntax error on
the array column). For those tests, invoke pytest with:

    DJANGO_SETTINGS_MODULE=backend.settings pytest tests/

and ensure the DB_* env vars point at a running Postgres instance.
"""

from .settings import *  # noqa: F401,F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}
