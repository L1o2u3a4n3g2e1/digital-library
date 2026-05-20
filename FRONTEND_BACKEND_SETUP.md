# Frontend-Backend Integration Guide

## Overview
This guide explains how to run the complete Digital Library system with React frontend and PHP backend.

## Prerequisites
- XAMPP with PHP 7.4+ and MySQL running
- Node.js 14+ and npm
- Composer dependencies installed
- Database migrations completed

## System Architecture

### Backend (PHP)
- **Location**: `backend/`
- **Entry Point**: `backend/index.php`
- **Base URL**: `http://localhost/digital-library/backend/api`
- **Tech Stack**: PHP 7.4+, MySQLi, PHPMailer, JWT (firebase/php-jwt)

### Frontend (React)
- **Location**: `digital-library-main/digital_library/`
- **Dev Server**: `npm start` (usually runs on http://localhost:3000)
- **Tech Stack**: React 19, React Router, Axios, Tailwind CSS

## Running the System

### Step 1: Start XAMPP
```bash
# Windows
# Open XAMPP Control Panel and start Apache and MySQL
```

### Step 2: Verify Database
```bash
# Check that database is running
mysql -u root -e "USE multilingual_library; SELECT COUNT(*) FROM users;"
```

### Step 3: Start Backend
The backend runs automatically when you access it through XAMPP:
```
http://localhost/digital-library/backend/api/health
```

Should return:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-20 10:30:45"
  }
}
```

### Step 4: Start Frontend Dev Server
```bash
cd digital-library-main/digital_library

# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

Frontend will open at `http://localhost:3000`

## API Configuration

### Frontend Environment (.env)
```
REACT_APP_API_URL=http://localhost:80/digital-library/backend
REACT_APP_DEBUG=true
```

### Backend Environment (.env)
Key settings:
```
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=multilingual_library

# Email (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_USERNAME=nishiannelou33@gmail.com
MAIL_PASSWORD="rgdz domm xndo idve"

# CORS - Allow frontend origins
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,http://localhost

# JWT
JWT_SECRET=your-secret-key-min-32-chars-change-this-in-production
JWT_EXPIRY=86400

# URLs
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:80,http://localhost
```

## Authentication Flows

### 1. Email Registration Flow
```
Register.js
  ↓
POST /api/auth/register
  ↓ (on success)
Store pending email in localStorage
  ↓
Navigate to /verify-email
  ↓
VerifyEmail.js
  ↓
POST /api/auth/verify-email (with 6-digit code)
  ↓ (on success)
AUTO LOGIN with JWT token
  ↓
Redirect to /dashboard
```

**Expected Time**: Code sent immediately via Gmail SMTP (~2 seconds), code expires in 15 minutes

### 2. Guest Registration Flow
```
Login.js (Guest Tab)
  ↓
Enter phone number (e.g., +250 7XX XXX XXX)
  ↓
POST /api/auth/register-guest
  ↓ (on success)
Receive JWT token immediately
  ↓
AUTO LOGIN
  ↓
Redirect to /dashboard
```

**Expected Time**: ~1 second, no email verification needed

### 3. Email Login Flow
```
Login.js (Email Tab)
  ↓
POST /api/auth/login
  ↓ (on success if email verified)
Receive JWT token and user data
  ↓
AUTO LOGIN
  ↓
Redirect to /dashboard
```

**Expected Time**: ~1 second

## Testing the Complete Flow

### Test 1: Email Registration
1. Go to `http://localhost:3000/register`
2. Fill form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm: "password123"
3. Click Register
4. Check email inbox (mail sent to test@example.com)
5. Copy 6-digit code
6. Go to verify-email page
7. Paste code and verify
8. Should auto-login and redirect to dashboard

### Test 2: Guest Registration
1. Go to `http://localhost:3000/login`
2. Scroll to "Continue as Guest" section
3. Enter phone: "+250 788 123 456"
4. Click "Continue as Guest"
5. Should auto-login and redirect to dashboard

### Test 3: Email Login (After Verification)
1. Go to `http://localhost:3000/login`
2. Enter verified email and password
3. Click Login
4. Should redirect to dashboard with user data

## API Endpoints

### Auth Endpoints

#### POST /api/auth/register
Register with email
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+250788123456" // optional
}
```

Response (201):
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify.",
  "data": {
    "user_id": 123,
    "email": "john@example.com",
    "next_step": "verify_email"
  }
}
```

#### POST /api/auth/register-guest
Register as guest with phone only
```json
{
  "phone": "+250788123456"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Guest registration successful",
  "data": {
    "user_id": 124,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user_type": "guest"
  }
}
```

#### POST /api/auth/verify-email
Verify email with code
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "is_verified": true,
      "is_guest": false
    }
  }
}
```

#### POST /api/auth/login
Login with email/password
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com",
      "is_verified": true
    }
  }
}
```

#### GET /api/auth/me
Get current user (requires Bearer token)
```
Header: Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "is_verified": true
  }
}
```

#### POST /api/auth/logout
Logout current user
```
Header: Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "message": "Logout successful",
  "data": []
}
```

#### POST /api/auth/resend-verification
Resend verification code
```json
{
  "email": "john@example.com"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Verification email sent",
  "data": {
    "email": "john@example.com"
  }
}
```

## Troubleshooting

### "Network error" on registration
**Cause**: Frontend cannot reach backend
**Solution**:
1. Check backend is running: `http://localhost/digital-library/backend/api/health`
2. Check CORS headers in browser DevTools Network tab
3. Update `REACT_APP_API_URL` in frontend `.env`

### "Email already registered" error
**Cause**: Email exists in database
**Solution**: Use a different email or delete the user from database

### "Invalid or expired token" on email verification
**Cause**: Code expired or incorrect
**Solution**: 
1. Codes expire after 15 minutes
2. Use resend verification to get new code
3. Check code was copied correctly

### "Token expired" on login
**Cause**: JWT token expired (24 hours by default)
**Solution**: User needs to login again

### "Email sending failed"
**Cause**: Gmail SMTP credentials invalid
**Solution**:
1. Check Gmail account allows app passwords
2. Verify credentials in `.env`
3. Check logs in `logs/app.log`

### CORS errors in browser
**Cause**: Frontend origin not in ALLOWED_ORIGINS
**Solution**: Add frontend origin to backend `.env` ALLOWED_ORIGINS

## Database Schema

Key tables:
- `users`: User accounts (id, email, password_hash, phone, is_verified, is_guest, etc.)
- `user_activity`: Activity logs (login, logout, registration, etc.)
- `notification_preferences`: User notification settings

## Security Notes

1. **Passwords**: Hashed with bcrypt (cost factor 10)
2. **Tokens**: JWT tokens with 24-hour expiry
3. **Verification Codes**: 6-digit codes with 15-minute expiry
4. **Database**: All queries use prepared statements (SQL injection protection)
5. **CORS**: Restricted to allowed origins only
6. **Email**: Password stored as environment variable (app password, not actual password)

## Next Steps

1. ✅ Backend API implementation
2. ✅ Frontend API integration
3. ✅ Email registration & verification flow
4. ✅ Guest registration flow
5. ✅ Login flow
6. TODO: SMS notifications (integrate Twilio)
7. TODO: Password reset flow
8. TODO: User profile management
9. TODO: Book management endpoints
10. TODO: Search and recommendations

## Support

For issues, check:
1. Browser console (F12 → Console tab)
2. Network tab (F12 → Network tab) - see API responses
3. Backend logs: `logs/app.log`
4. Browser localStorage: `ml_token`, `ml_user`, `ml_pending_email`
