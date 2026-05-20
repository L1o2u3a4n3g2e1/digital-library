# Digital Library Fix Report

Date: 2026-05-20

## Fixed

- Auth routes now match the frontend contract.
  - Added backend routing for `POST /auth/resend-verification` and `POST /auth/logout`.
- Verification expiry is now stored as a real `DATETIME`.
  - `verification_token_expiry` is now written as `Y-m-d H:i:s` instead of a Unix timestamp.
- Token validation errors now return a `message` field.
  - This prevents broken error handling in `/auth/me`.
- Registration, verification, and login now work end to end.
  - Verified live with a fresh account.
- Verification responses are testable even if email delivery fails.
  - In development, the verification code is returned in the API response.
  - Development email copies are written to `logs/email-outbox.log`.
- Frontend verification flow now stores and clears pending verification state correctly.
  - Includes development fallback code support on the verify page.
- Email debug output no longer corrupts JSON API responses.
- Notification preference creation is idempotent.
  - Duplicate inserts no longer create avoidable database errors.
- Backend now exposes the content endpoints the frontend already expects.
  - Added basic support for:
    - `GET /books`
    - `GET /books/search`
    - `GET /books/recommended`
    - `GET /books/:id`
    - `POST /upload/book`
    - `POST /upload/cover`
    - `POST /translate`
    - `GET /translate/languages`
    - `POST /audio/generate`
    - `GET /audio/:id`
    - `GET /stats`
    - `POST /stats/read`
- Frontend content services now unwrap backend `data` payloads correctly.
  - This stops dashboard, search, and reader from silently ignoring valid API responses.
- Config cleanup completed.
  - Replaced the placeholder JWT secret.
  - Disabled frontend debug env flag.
  - Normalized the SMTP password format in `.env`.

## Verified

- `GET /health` returns success.
- `GET /books`, `GET /books/recommended`, `GET /stats`, and `GET /translate/languages` return success.
- Fresh registration succeeded.
- Verification succeeded using the generated code.
- Login succeeded after verification.
- Frontend production build succeeded with `npm run build`.

## Still Lightweight

- Books, stats, translation, audio, and upload endpoints are now present and stable for testing, but they are currently implemented as lightweight mock-backed backend services rather than a full production data model.
- Profile, bookmarks, and some UI copy still rely on local frontend state or mock data.
- SMTP delivery can still depend on Gmail account state, but development fallback now prevents it from blocking testing.
