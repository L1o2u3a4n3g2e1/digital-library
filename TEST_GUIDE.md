# Step-by-Step Testing Guide

Follow these exact steps to verify everything is working.

## 🟢 Test 1: Backend Health Check (2 minutes)

### Goal
Verify the PHP backend is accessible and working

### Steps
1. Open browser and visit: `http://localhost/digital-library/backend/api/health`
2. You should see:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-20 10:30:45"
  }
}
```

### If It Fails
- Check XAMPP Control Panel - Apache should have green "Running" indicator
- Check MySQL is also running (green indicator)
- Check URL path is correct

---

## 🟢 Test 2: Start Frontend Dev Server (3 minutes)

### Goal
Get React development server running

### Steps
1. Open Terminal/PowerShell
2. Navigate to frontend:
```bash
cd c:\Users\BALIA\Desktop\digital-library\digital-library-main\digital_library
```
3. Start development server:
```bash
npm start
```
4. Wait for "Compiled successfully" message
5. Browser should automatically open to `http://localhost:3000`
6. You should see "Digital Library" landing page

### If It Fails
- Check Node.js is installed: `node --version`
- Check npm is installed: `npm --version`
- Try: `npm install` first if dependencies missing
- Check port 3000 is not in use

---

## 🟢 Test 3: Registration Flow (5 minutes)

### Goal
Test complete registration → verification → login flow

### Steps

**3.1 - Go to Register Page**
1. Frontend already open at `http://localhost:3000`
2. Click "Register" in top navigation or go to `/register`
3. You should see registration form with fields:
   - Full Name
   - Email
   - Password
   - Confirm Password
   - Language selector

**3.2 - Fill Registration Form**
1. Full Name: "Test User"
2. Email: "testuser1234@gmail.com" (use YOUR Gmail)
3. Password: "Password123!"
4. Confirm: "Password123!"
5. Select English language
6. Click "Register" button

**3.3 - Check for Errors**
1. Form should validate:
   - ✅ Name not empty
   - ✅ Email format valid
   - ✅ Password length >= 6
   - ✅ Passwords match
2. Loading spinner appears while submitting
3. Should take 1-2 seconds

**3.4 - Check Browser Network**
1. Press F12 to open DevTools
2. Go to "Network" tab
3. Look for request to `/auth/register`
4. Click it and check:
   - Status: 201 (Created)
   - Response contains: `"success": true`
   - Response contains: `user_id`

**3.5 - Verify Email Check**
1. After successful registration, you should be redirected to `/verify-email` page
2. Page shows email: "testuser1234@gmail.com"
3. Input field for 6-digit code
4. Button: "Verify"

**3.6 - Get Verification Code**
1. Check your Gmail inbox (may be in spam folder)
2. Look for email from nishiannelou33@gmail.com
3. Subject: "Verify Your Email - Digital Library"
4. Body contains 6-digit code (e.g., "123456")
5. Copy the code

**3.7 - Enter Verification Code**
1. Go back to browser (verify-email page)
2. Paste 6-digit code into code input
3. Code should be centered and large
4. Click "Verify" button
5. Should take 1-2 seconds

**3.8 - Check Verification Response**
1. Open DevTools Network tab again
2. Look for `/auth/verify-email` request
3. Check:
   - Status: 200 (OK)
   - Response contains: `"token": "eyJ..."`
   - Response contains: `"user": { "id": ..., "name": "Test User" }`

**3.9 - Auto-Login**
1. After verification succeeds:
2. Page shows green checkmark: "Email verified successfully!"
3. Automatically redirects to `/dashboard` (2-second delay)
4. Dashboard loads with user data

**3.10 - Verify Token Stored**
1. Open DevTools Console (F12 → Console)
2. Run command:
```javascript
localStorage.getItem('ml_token')
```
3. You should see a long JWT token starting with "eyJ"

### Expected Timeline
- Registration submit: ~1 second
- Email sent: ~1 second
- Email arrives: ~10 seconds
- Verification: ~1 second
- Total: ~15 seconds (mostly waiting for email)

### Success Criteria ✅
- [ ] Registration form submits
- [ ] Redirected to verify-email page
- [ ] Email received
- [ ] Verification code accepted
- [ ] Auto-logged into dashboard
- [ ] Token stored in localStorage
- [ ] User data displayed

---

## 🟢 Test 4: Login Flow (3 minutes)

### Goal
Test login with registered email account

### Steps

**4.1 - Logout First**
1. Click profile icon (top right of dashboard)
2. Click "Logout" or go to `/login`
3. Verify you're back at login page

**4.2 - Login Form**
1. You should see:
   - Email input
   - Password input
   - Forgot password link
   - "Continue as Guest" section
2. Fill form:
   - Email: "testuser1234@gmail.com" (same as registration)
   - Password: "Password123!"
3. Click "Login" button

**4.3 - Check Network**
1. Open DevTools (F12)
2. Look for `/auth/login` request
3. Status should be 200
4. Response contains token and user data

**4.4 - Auto-Login**
1. After login succeeds:
2. Should see success message
3. Redirected to dashboard
4. Same user data displayed

### Success Criteria ✅
- [ ] Login form accepts email and password
- [ ] Network request succeeds (200 status)
- [ ] Token received
- [ ] Auto-redirect to dashboard
- [ ] User is logged in

---

## 🟢 Test 5: Guest Registration (3 minutes)

### Goal
Test guest registration with phone only

### Steps

**5.1 - Go to Login Page**
1. Go to `http://localhost:3000/login`
2. You should see:
   - Email/password login form
   - "Continue as Guest" section with phone input

**5.2 - Phone Registration**
1. Click on phone input field
2. Enter phone number: "+250788123456"
3. Click "Continue as Guest" button
4. Loading spinner appears

**5.3 - Check Network**
1. Open DevTools (F12 → Network)
2. Look for `/auth/register-guest` request
3. Status: 201
4. Response contains: `token` and `user_id`

**5.4 - Auto-Login as Guest**
1. After submit succeeds:
2. Immediately logged in as guest
3. Redirected to dashboard
4. User data shows: `is_guest: true`

### Success Criteria ✅
- [ ] Phone input accepts format
- [ ] Network request succeeds (201 status)
- [ ] Token received immediately
- [ ] Auto-redirect to dashboard
- [ ] Guest user data displayed
- [ ] No email verification needed

---

## 🟢 Test 6: Resend Verification Code (2 minutes)

### Goal
Test resending verification code

### Steps

**6.1 - Start New Registration**
1. Go to `/register`
2. Register with new email: "testuser5678@gmail.com"
3. Fill form and submit
4. Redirected to `/verify-email`

**6.2 - Don't Enter Code Yet**
1. On verify-email page
2. See phone input with code
3. See button: "Didn't receive code?"

**6.3 - Click Resend**
1. Click resend button
2. Should show "Resending..." state
3. After 1-2 seconds, shows message: "✓ New code sent to your email"

**6.4 - Check New Email**
1. Check Gmail inbox again
2. You should receive TWO emails (original + resend)
3. Copy new code

**6.5 - Verify with New Code**
1. Paste new code into input
2. Click Verify
3. Should verify successfully

### Success Criteria ✅
- [ ] Resend button works
- [ ] New email sent
- [ ] New code received
- [ ] New code accepted for verification

---

## 🔴 Test 7: Error Handling (2 minutes)

### Goal
Verify error messages work properly

### Steps

**7.1 - Test Invalid Email Format**
1. Go to `/register`
2. Fill form with:
   - Email: "notanemail"
   - Everything else valid
3. Try to submit
4. Should see error: "Email is required" or "Invalid email"

**7.2 - Test Password Mismatch**
1. Go to `/register`
2. Fill form:
   - Password: "password123"
   - Confirm: "password456"
3. Try to submit
4. Should see error: "Passwords do not match"

**7.3 - Test Wrong Verification Code**
1. Start registration with valid email
2. Get verification code
3. Enter WRONG code (off by one digit)
4. Click Verify
5. Should see error: "Invalid or expired token"

**7.4 - Test Expired Code**
1. Start registration
2. Wait 16+ minutes (code expires after 15)
3. Try to verify with correct code
4. Should see error: "Invalid or expired token"
5. Use "Resend" to get fresh code

### Success Criteria ✅
- [ ] Validation errors show
- [ ] Error messages are clear
- [ ] Form doesn't submit with invalid data
- [ ] API errors handled properly
- [ ] User can recover (resend, try again)

---

## 🔵 Bonus: Browser Storage Check

### Goal
Verify data is persisted correctly

### Steps

**Check localStorage**
1. Press F12 (DevTools)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Click "Local Storage" → "http://localhost:3000"
4. You should see:
   - `ml_token`: Long JWT token
   - `ml_user`: JSON with user data
   - `ml_lang`: "en" or other language
   - `ml_theme`: "light" or "dark"

**Clear Storage & Relogin**
1. Delete `ml_token` from localStorage
2. Refresh page - should redirect to login
3. Login again - should work

**Check Network Requests**
1. Go to Network tab
2. Login and verify each request:
   - POST to `/auth/login` → 200 response
   - GET to `/auth/me` (if app calls it) → 200 response

---

## 📊 Test Results Summary

Create a summary table:

| Test | Result | Notes |
|------|--------|-------|
| Backend Health | ✅ PASS | Returns status ok |
| Frontend Start | ✅ PASS | npm start works |
| Registration | ✅ PASS | Email verification works |
| Email Send | ✅ PASS | Code received in inbox |
| Verification | ✅ PASS | Code accepted |
| Login | ✅ PASS | Can login with email/password |
| Guest Flow | ✅ PASS | Phone registration works |
| Resend Code | ✅ PASS | New code sent and works |
| Error Messages | ✅ PASS | Validation errors show |
| Storage | ✅ PASS | Token persisted in localStorage |

---

## 🆘 If Tests Fail

### Backend Health Check Failed
```
Check:
1. XAMPP Control Panel - Apache and MySQL green?
2. Database running? mysql -u root
3. Try direct IP: http://127.0.0.1/...
4. Check logs: backend/../logs/app.log
```

### Frontend Won't Start
```
Check:
1. Node installed? node --version
2. npm installed? npm --version
3. Dependencies? npm install
4. Port 3000 free? lsof -i :3000
5. Clear cache? rm -rf node_modules && npm install
```

### Registration Fails
```
Check Network Tab (F12):
1. Does /auth/register request get sent?
2. What's the HTTP status?
3. What's the error message in response?
4. Check backend logs for error details
```

### Email Not Sent
```
Check:
1. Gmail credentials in .env correct?
2. App password enabled in Gmail?
3. Check logs: backend/../logs/app.log
4. Try different Gmail account?
5. Check spam folder
```

### Verification Code Wrong
```
Check:
1. Did you copy full 6-digit code?
2. Are extra spaces included?
3. Code not expired? (15 minute limit)
4. Check database: SELECT * FROM users WHERE id = ?
```

### Can't Login After Verify
```
Check:
1. Is user is_verified = 1 in database?
2. Is password hash correct in database?
3. Check network response from /auth/login
4. Check backend logs for errors
```

---

## 📝 Test Notes

Use this space to document your test results:

```
Test Date: [Date]
Tester: [Your Name]
Backend URL: http://localhost/digital-library/backend/api
Frontend URL: http://localhost:3000

Results:
- Registration: _________
- Verification: _________
- Login: _________
- Guest: _________
- Resend: _________

Issues Found:
1. ___________
2. ___________
3. ___________

Notes:
___________________________
```

---

**All tests should pass!** If any fail, check the Debugging section or review logs.
