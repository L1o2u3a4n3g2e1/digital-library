# Vercel Production Setup

This app is only fully real when Vercel has real infrastructure credentials.

## Why it falls back to demo mode

The backend automatically switches to demo mode when any of these core production services are missing:

- remote MySQL database
- SMTP email credentials
- Africa's Talking SMS credentials
- non-placeholder JWT secret

You can verify the current state from:

- `/api/health`
- `/api/health/ready`

## Required Vercel environment variables

Add these in Vercel Project Settings -> Environment Variables.

### Core application

```env
APP_ENV=production
APP_URL=https://digital-library-nishiannelou33-5202s-projects.vercel.app
FRONTEND_URL=https://digital-library-nishiannelou33-5202s-projects.vercel.app
ALLOWED_ORIGINS=https://digital-library-nishiannelou33-5202s-projects.vercel.app,https://digital-library-phi-one.vercel.app
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
```

### Real MySQL database

Use either a connection URL or discrete values.

Option A:

```env
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
```

Option B:

```env
MYSQLHOST=your-mysql-host
MYSQLPORT=3306
MYSQLUSER=your-mysql-user
MYSQLPASSWORD=your-mysql-password
MYSQLDATABASE=your-mysql-database
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=false
```

### Real email delivery

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=your-email@gmail.com
MAIL_FROM_NAME=Digital Library
```

### Real SMS delivery with Africa's Talking

```env
SMS_PROVIDER=africastalking
SMS_MODE=live
AT_USERNAME=your-africastalking-app-username
AT_API_KEY=your-africastalking-api-key
AT_SENDER_ID=your-approved-sender-id
```

## Manual Vercel settings

These are not code changes. They must be changed in the Vercel dashboard.

### 1. Disable deployment protection for public pitching

If the API redirects to Vercel Authentication, open:

- Project Settings -> Deployment Protection

Then make production publicly accessible for your pitch flow.

### 2. Redeploy after adding environment variables

Vercel only applies new environment variables to new deployments.

After saving the values above, trigger a new production redeploy.

## What becomes real after setup

- users persist in MySQL
- verification and password reset emails send through SMTP
- guest verification SMS sends through Africa's Talking
- reading analytics persist in MySQL
- uploads persist in MySQL instead of browser cookies

## Quick verification checklist

After redeploy:

1. Open `/api/health/ready`
2. Confirm `production_ready: true`
3. Register a new user
4. Verify by real email
5. Request password reset
6. Start guest sign-in and confirm real SMS arrival
