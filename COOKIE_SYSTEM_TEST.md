# Cookie System Testing Guide

## Quick Start

### Step 1: Run Database Migration

Before testing, ensure the database tables are created. Access the migration script:

```
http://localhost:8000/backend/migrate-cookies.php
```

Or if you have MySQL CLI access:

```bash
mysql -u root -p"" multilingual_library < database/migrations/002_add_cookie_system.sql
```

### Step 2: Start the Backend Server

```bash
php -S localhost:8000 -t . backend/index.php
```

## Testing Scenarios

### Scenario 1: Basic Login with Cookies

**Test:** User logs in and receives auth cookies

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
```

**Expected:**
- Response contains `token` in JSON
- `cookies.txt` contains three cookies:
  - `auth_token` - JWT token
  - `csrf_token` - CSRF protection
  - `user_preferences` - User settings

### Scenario 2: Remember-Me Cookie

**Test:** Login with remember-me flag for 30-day session

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password",
    "remember_me": true
  }'
```

**Expected:**
- Additional `remember_me` cookie (30 days expiry)
- Database entry in `remember_me_tokens` table
- Token hash stored securely

### Scenario 3: Get User Preferences

**Test:** Fetch preferences with cookie authentication

```bash
curl -X GET http://localhost:8000/api/preferences \
  -b cookies.txt
```

**Expected Response:**
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

### Scenario 4: Update Preferences

**Test:** Update multiple preferences with CSRF protection

```bash
curl -X PUT http://localhost:8000/api/preferences \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "theme": "dark",
    "language": "ar"
  }' \
  -H "X-CSRF-Token: $(grep csrf_token cookies.txt | awk '{print $NF}')"
```

**Expected:**
- Preferences updated in database
- `user_preferences` cookie updated
- Response includes updated preferences

### Scenario 5: Update Single Preference

**Test:** Update one preference via PATCH

```bash
curl -X PATCH http://localhost:8000/api/preferences/theme \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"value": "light"}'
```

**Expected:**
- Only theme preference changes
- Other preferences remain unchanged

### Scenario 6: CSRF Token Validation

**Test:** Verify CSRF protection works

```bash
# This should fail (no CSRF token)
curl -X PUT http://localhost:8000/api/preferences \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"theme": "dark"}'
```

**Expected:** 
- 403 Forbidden or validation error
- Request is rejected without valid CSRF token

### Scenario 7: Logout Clears Cookies

**Test:** Logout removes all cookies

```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt \
  -c cookies-after-logout.txt
```

**Expected:**
- Response: "Logout successful"
- Cookies are cleared (expiry set to past)
- `cookies-after-logout.txt` contains empty/expired cookies

### Scenario 8: Authenticated Requests After Logout

**Test:** Using old cookies fails after logout

```bash
curl -X GET http://localhost:8000/api/preferences \
  -b cookies-after-logout.txt
```

**Expected:**
- 401 Unauthorized
- Error: "Token required" or similar

### Scenario 9: Get CSRF Token

**Test:** Generate or retrieve CSRF token

```bash
curl -X GET http://localhost:8000/api/csrf-token \
  -c csrf-cookies.txt
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "csrf_token": "a1b2c3d4e5f6..."
  }
}
```

### Scenario 10: Reset Preferences

**Test:** Reset all preferences to defaults

```bash
curl -X POST http://localhost:8000/api/preferences/reset \
  -b cookies.txt
```

**Expected:**
- All preferences returned to defaults
- Database entry updated
- Cookie refreshed with default values

## Frontend Integration Test

### JavaScript Example

```javascript
// 1. Login and get cookies
async function login(email, password, rememberMe = false) {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, remember_me: rememberMe })
  });
  return response.json();
}

// 2. Get preferences
async function getPreferences() {
  const response = await fetch('http://localhost:8000/api/preferences', {
    method: 'GET',
    credentials: 'include'
  });
  return response.json();
}

// 3. Update preferences with CSRF
async function updatePreferences(prefs) {
  const csrfToken = getCookie('csrf_token');

  const response = await fetch('http://localhost:8000/api/preferences', {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(prefs)
  });
  return response.json();
}

// 4. Logout
async function logout() {
  const response = await fetch('http://localhost:8000/api/auth/logout', {
    method: 'POST',
    credentials: 'include'
  });
  return response.json();
}

// Helper to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Test flow
(async () => {
  // Register and verify first
  const loginResult = await login('test@example.com', 'password123', true);
  console.log('Login:', loginResult);

  const prefs = await getPreferences();
  console.log('Preferences:', prefs);

  const updateResult = await updatePreferences({ theme: 'dark' });
  console.log('Updated:', updateResult);

  const logoutResult = await logout();
  console.log('Logout:', logoutResult);
})();
```

## Database Verification

### Check Tables Created

```sql
-- Verify remember_me_tokens table
SHOW TABLES LIKE 'remember_me_tokens';
DESC remember_me_tokens;

-- Verify csrf_tokens table
SHOW TABLES LIKE 'csrf_tokens';
DESC csrf_tokens;

-- Verify cookie_sessions table
SHOW TABLES LIKE 'cookie_sessions';
DESC cookie_sessions;

-- Verify users table has new columns
DESC users;
```

### Check Sample Data

```sql
-- View a user's preferences
SELECT id, email, preferences FROM users WHERE email = 'test@example.com';

-- View remember-me tokens
SELECT user_id, token_hash, expires_at FROM remember_me_tokens;

-- View active sessions
SELECT user_id, session_id, expires_at FROM cookie_sessions WHERE is_active = 1;
```

## Common Issues & Fixes

### Issue: CORS Error

**Symptom:** `No 'Access-Control-Allow-Credentials' header`

**Fix:** Ensure CORS headers are set:
```php
header('Access-Control-Allow-Credentials: true');
```

### Issue: Cookies Not Set

**Symptom:** Cookies don't appear in browser

**Fix:** 
1. Check credentials: 'include' in fetch
2. Verify domain matches (not mixing localhost:8000 and 127.0.0.1)
3. Check SameSite restrictions
4. Ensure response is successful (not 401/403)

### Issue: CSRF Token Mismatch

**Symptom:** 403 Forbidden on preference updates

**Fix:**
1. Ensure CSRF token is retrieved first
2. Pass token in `X-CSRF-Token` header
3. Verify token is still valid (2-hour expiry)

### Issue: Preferences Cookie Not Accessible

**Symptom:** Can't read `user_preferences` from JavaScript

**Fix:**
- This is intentional by default (HttpOnly on preference cookie)
- To make readable, check CookieService settings
- Frontend can still use preference endpoints

## Performance Testing

### Load Test: Multiple Preferences Updates

```bash
for i in {1..100}; do
  curl -X PUT http://localhost:8000/api/preferences \
    -H "Content-Type: application/json" \
    -b cookies.txt \
    -d "{\"font_size\": \"$([ $((i % 2)) == 0 ] && echo 'small' || echo 'large')\"}"
done
```

### Cleanup Test: Verify Expired Token Removal

Check database after 1 hour:
```sql
-- Should be empty (cleanup event runs hourly)
SELECT COUNT(*) FROM remember_me_tokens WHERE expires_at < NOW();
SELECT COUNT(*) FROM csrf_tokens WHERE expires_at < NOW();
```

## Security Testing

### Test HTTPS Requirement (Production)

Change `APP_ENV=production` and test that:
1. Cookies have Secure flag
2. SameSite=Strict is enforced
3. HttpOnly flag is set on sensitive cookies

### Test Token Expiry

```bash
# Wait for CSRF token expiry (2 hours) and test
# CSRF validation should fail after 2 hours
```

### Test Remember-Me Token Rotation

```bash
# Simulate device fingerprint change
# Should invalidate old tokens
```

## Success Criteria

- ✓ Login sets auth_token cookie
- ✓ Preferences can be retrieved with cookie auth
- ✓ Preferences can be updated with CSRF protection
- ✓ CSRF tokens are validated
- ✓ Logout clears all cookies
- ✓ Expired tokens are removed by cleanup event
- ✓ Remember-me works for 30 days
- ✓ Preferences persist across sessions
- ✓ System is secure by default
- ✓ No sensitive data in JavaScript-readable cookies
