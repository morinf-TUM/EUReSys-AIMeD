# Follow-ups

Bugs and deferred work surfaced while unifying the dev/prod repo
(branch `merge/deployed-rescue`). Not blocking the merge — logged
here so they don't get lost.

## Bugs

### MDR classification returns wrong results
- **Surfaced:** 2026-04-20, dev-rehearsal UI. A run through the
  regulatory scoping flow produced an MDR classification that didn't
  match the expected result.
- **Where to start:** `backend/core/decision_engine/mdr_engine.py`,
  and the `RecommendationEngine.generate_recommendation()` entry
  point in `backend/core/recommendation_engine.py`.
- **Needs:** a concrete input + expected classification to reproduce.
  The rescued test `backend/core/tests/test_recommendation_engine.py`
  asserts `'IIa'` for an AI-monitoring device — that still passes,
  so the bug is either in a case not covered by those three tests
  or in how the web flow feeds inputs to the engine.

### `User.email` has no uniqueness constraint
- **Where:** `backend/core/auth_views.py:97` does
  `User.objects.get(email=email)`, but Django's built-in
  `auth.User.email` is not unique, and the registration code allows
  repeat emails.
- **Symptom:** login crashes with `MultipleObjectsReturned`
  ("get() returned more than one user") as soon as two rows share
  an email.
- **Fix direction:** either switch to a custom User model with
  `email = EmailField(unique=True)` (cleaner, but migrates every
  existing row), or add a dedup + `UniqueConstraint` migration on
  the built-in `auth_user` table. Must also make the registration
  path reject duplicates up front.

## Tech debt

### `mistralai` pinned to 0.x
- `requirements.txt` pins `mistralai>=0.1.0,<1.0` because
  `backend/llm/llm_service.py` uses the 0.x surface (`MistralClient`,
  `mistralai.models.chat_completion.ChatMessage`).
- 1.x+ SDK is a full rewrite (`from mistralai import Mistral`,
  different client/message API). Migration touches every call site
  in `llm_service.py` but is otherwise low-risk.

### `ArrayField` blocks sqlite-based tests
- Several models in `backend/core/models/*` use
  `django.contrib.postgres.fields.ArrayField`. SQLite can't migrate
  those columns (`near "[]": syntax error`), so
  `backend/settings_test.py` is only usable for no-DB
  `SimpleTestCase` / plain `unittest.TestCase` tests today.
- Fix: migrate `ArrayField` columns to `JSONField`. Postgres still
  stores JSON efficiently (JSONB), and sqlite gets full-fidelity
  tests. Unlocks fast ORM-backed tests without a live Postgres.
