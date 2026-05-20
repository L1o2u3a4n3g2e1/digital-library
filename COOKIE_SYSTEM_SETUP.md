# Cookie System Setup Guide

This guide explains how to set up and use the comprehensive cookie system for the Digital Library.

## Overview

The cookie system includes:
1. **Session Auth Cookies** - Secure HTTP-only cookies storing JWT tokens
2. **Remember-Me Cookies** - Long-lived tokens for persistent login across sessions
3. **User Preferences Cookies** - Non-sensitive user preferences (theme, language, etc.)
4. **CSRF Protection** - Tokens to prevent cross-site request forgery

## Setup Instructions

### 1. Run Database Migration

The cookie system requires new database tables. Run the migration:

```bash
php backend/run-migration.php database/migrations/002_add_cookie_system.sql
```

This creates:
- `remember_me_tokens` table
- `csrf_tokens` table
- `cookie_sessions` table
- Adds `preferences` and `updated_at` columns to `users` table
- Creates a cleanup event to remove expired tokens every hour

### 2. Update Environment Configuration

Ensure your `.env` file has the following settings:

```env
# Cookie Security
APP_ENV=development  # Set to 'production' for HTTPS-only cookies

# CORS Settings (allow credentials)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

For **production**, the system will automatically:
- Enable Secure flag (requires HTTPS)
- Use SameSite=Lax for cross-site cookies
- Use SameSite=Strict for CSRF tokens

### 3. Update Frontend CORS Configuration

Ensure your frontend sends cookies with requests:

```javascript
// JavaScript fetch example
fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  credentials: 'include',  // Include cookies with request
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
    remember_me: true  // Optional: for 30-day login
  })
});
```

## API Endpoints

### Authentication Endpoints

All auth endpoints automatically set cookies on success.

#### `POST /api/auth/login`
Login with email/password and optional remember-me.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password",
  "remember_me": true
}
```

**Cookies Set:**
- `auth_token` - JWT token (7 days)
- `remember_me` - Long-lived session (30 days, if requested)
- `csrf_token` - CSRF protection (2 hours)
- `user_preferences` - User settings

#### `POST /api/auth/logout`
Clear all auth cookies and revoke session.

**Cookies Cleared:**
- `auth_token`
- `remember_me`
- `csrf_token`

#### `POST /api/auth/register`
Register new user (sets cookies after email verification).

### Preference Endpoints

#### `GET /api/preferences`
Get all user preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "light",
    "language": "en",
    "font_size": "medium",
    "line_height": "normal",
    "pagination_style": "continuous",
    "notifications_email": true,
    "notifications_push": false,
    "notifications_sms": false,
    "auto_read_logging": true,
    "show_reading_time": true,
    "keep_reading_history": true,
    "recommended_books": true,
    "newsletter_subscription": false,
    "profile_visibility": "private",
    "two_factor_enabled": false
  }
}
```

#### `PUT /api/preferences`
Update multiple preferences.

**Request:**
```json
{
  "theme": "dark",
  "language": "ar",
  "notifications_email": false
}
```

#### `PATCH /api/preferences/:key`
Update single preference.

**Request:**
```json
{
  "value": "dark"
}
```

**Example:**
```bash
PATCH /api/preferences/theme
Content-Type: application/json

{"value": "dark"}
```

#### `POST /api/preferences/reset`
Reset all preferences to defaults.

#### `GET /api/csrf-token`
Get or generate CSRF token.

**Response:**
```json
{
  "success": true,
  "data": {
    "csrf_token": "abc123def456..."
  }
}
```

## User Preferences

### Available Preferences

| Key | Type | Values | Default |
|-----|------|--------|---------|
| theme | string | light, dark, auto | light |
| language | string | en, ar, fr, es, de, pt, zh | en |
| font_size | string | small, medium, large, xlarge | medium |
| line_height | string | normal, comfortable, spacious | normal |
| pagination_style | string | continuous, paginated | continuous |
| notifications_email | boolean | true, false | true |
| notifications_push | boolean | true, false | false |
| notifications_sms | boolean | true, false | false |
| auto_read_logging | boolean | true, false | true |
| show_reading_time | boolean | true, false | true |
| keep_reading_history | boolean | true, false | true |
| recommended_books | boolean | true, false | true |
| newsletter_subscription | boolean | true, false | false |
| profile_visibility | string | private, friends, public | private |
| two_factor_enabled | boolean | true, false | false |

## CSRF Protection

### How It Works

1. Client gets CSRF token via `GET /api/csrf-token`
2. Token is stored in `csrf_token` cookie
3. Client includes token in request header or body
4. Server validates token before processing state-changing requests

### Implementation

**Send token in header (recommended):**
```javascript
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

fetch('http://localhost:8000/api/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  credentials: 'include',
  body: JSON.stringify({ theme: 'dark' })
});
```

**Or send in request body:**
```javascript
fetch('http://localhost:8000/api/preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    csrf_token: token,
    theme: 'dark'
  })
});
```

## Cookie Security

### Session Cookie (`auth_token`)
- **Duration:** 7 days
- **HttpOnly:** Yes (not accessible to JavaScript)
- **Secure:** Yes in production (HTTPS only)
- **SameSite:** Lax (allow cross-site navigation)

### Remember-Me Cookie (`remember_me`)
- **Duration:** 30 days (if enabled)
- **HttpOnly:** Yes
- **Secure:** Yes in production
- **SameSite:** Lax

### Preferences Cookie (`user_preferences`)
- **Duration:** 365 days
- **HttpOnly:** No (accessible to JavaScript for frontend themes)
- **Secure:** Yes in production
- **SameSite:** Lax

### CSRF Cookie (`csrf_token`)
- **Duration:** 2 hours
- **HttpOnly:** No (must be readable by JavaScript)
- **Secure:** Yes in production
- **SameSite:** Strict (most secure)

## Development vs Production

### Development Mode
```env
APP_ENV=development
```
- Cookies sent over HTTP
- Relaxed security settings for testing
- Useful for localhost development

### Production Mode
```env
APP_ENV=production
```
- Requires HTTPS
- Secure flag enabled
- SameSite policies enforced
- All sensitive data protected

## Testing

### Test Login Flow
```bash
# 1. Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Verify email (use code from response or logs)
curl -X POST http://localhost:8000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }' \
  -c cookies.txt

# 3. Check cookies
cat cookies.txt

# 4. Make authenticated request with cookie
curl -X GET http://localhost:8000/api/auth/me \
  -b cookies.txt

# 5. Get preferences
curl -X GET http://localhost:8000/api/preferences \
  -b cookies.txt

# 6. Update preferences
curl -X PUT http://localhost:8000/api/preferences \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "theme": "dark"
  }'

# 7. Logout (clears cookies)
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt
```

### Test CSRF Protection
```bash
# Get CSRF token
curl -X GET http://localhost:8000/api/csrf-token \
  -c cookies.txt

# Make request with CSRF token
curl -X PUT http://localhost:8000/api/preferences \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: token-from-cookie" \
  -b cookies.txt \
  -d '{"theme": "dark"}'
```

## Troubleshooting

### Cookies Not Being Set
1. Check browser DevTools > Application > Cookies
2. Verify CORS headers include `Access-Control-Allow-Credentials: true`
3. Ensure frontend uses `credentials: 'include'` in fetch
4. Check that domain matches (no localhost:8000 vs 127.0.0.1)

### CSRF Token Validation Fails
1. Get token via `GET /api/csrf-token` first
2. Include token in `X-CSRF-Token` header or request body
3. Ensure token is sent with state-changing requests (PUT, POST, DELETE)

### Cookies Lost After Refresh
1. Check cookie expiration time in DevTools
2. Verify database `remember_me_tokens` table has correct entries
3. Check cleanup event is running (purges expired tokens hourly)

### Same-Site Cookie Issues
1. Ensure frontend is on same domain in production
2. Use `credentials: 'include'` for cross-origin requests
3. Backend will handle SameSite=Lax for cross-site navigation

## Next Steps

1. ✓ Run migration: `php backend/run-migration.php database/migrations/002_add_cookie_system.sql`
2. Update frontend to send `credentials: 'include'` with requests
3. Test login/logout flow with cookies
4. Test preference endpoints
5. Implement CSRF token validation in forms
6. Monitor cookie behavior in production

## Support

For issues or questions:
1. Check application logs: `logs/app.log`
2. Enable DEBUG mode: `APP_DEBUG=true` in `.env`
3. Review database tables in phpMyAdmin
4. Check browser DevTools for cookie details
