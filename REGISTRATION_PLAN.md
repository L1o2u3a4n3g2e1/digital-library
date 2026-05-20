# Digital Library - Registration & Notification System Plan

**Status**: Planning Phase  
**Technology Stack**: React (Frontend) + PHP/MySQLi (Backend) + MySQL (Database)  
**Environment**: XAMPP

---

## 📋 Executive Overview

This plan outlines the complete flow for user registration with email notifications and guest access with phone notifications. The system supports three user types:
1. **Regular Users** - Register with email, receive email notifications
2. **Guest Users** - Access without registration, receive SMS notifications
3. **Admin/Librarian** - Full system access

---

## 🗄️ Phase 1: Database Schema Modifications

### Current State
The `users` table exists but lacks phone and guest support.

### Required Changes

#### 1.1 Expand `users` Table
```sql
ALTER TABLE `users` ADD COLUMN `phone_number` VARCHAR(20) NULL;
ALTER TABLE `users` ADD COLUMN `is_guest` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN `is_verified` TINYINT(1) NOT NULL DEFAULT 0;
ALTER TABLE `users` ADD COLUMN `verification_token` VARCHAR(255) NULL;
ALTER TABLE `users` ADD COLUMN `verification_token_expiry` DATETIME NULL;
ALTER TABLE `users` ADD COLUMN `last_login` DATETIME NULL;
ALTER TABLE `users` MODIFY COLUMN `email` VARCHAR(150) NULL; -- Make nullable for guests
ALTER TABLE `users` MODIFY COLUMN `password` VARCHAR(255) NULL; -- Make nullable for guests
```

#### 1.2 Create `notification_preferences` Table
```sql
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `email_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `sms_notifications` TINYINT(1) NOT NULL DEFAULT 0,
  `notification_frequency` ENUM('instant', 'daily', 'weekly') DEFAULT 'instant',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notification_prefs` (`user_id`),
  CONSTRAINT `fk_notification_preferences_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.3 Enhance `notifications` Table
```sql
ALTER TABLE `notifications` ADD COLUMN `notification_type` ENUM('registration', 'welcome', 'activity', 'system') DEFAULT 'activity';
ALTER TABLE `notifications` ADD COLUMN `sent_via` ENUM('email', 'sms', 'in_app') DEFAULT 'in_app';
ALTER TABLE `notifications` ADD COLUMN `recipient_phone` VARCHAR(20) NULL;
ALTER TABLE `notifications` ADD COLUMN `sent_at` DATETIME NULL;
ALTER TABLE `notifications` ADD COLUMN `delivery_status` ENUM('pending', 'sent', 'failed', 'bounced') DEFAULT 'pending';
```

#### 1.4 Create `email_logs` Table
```sql
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `recipient_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `body` LONGTEXT NOT NULL,
  `status` ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_logs_user_id` (`user_id`),
  CONSTRAINT `fk_email_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 1.5 Create `sms_logs` Table
```sql
CREATE TABLE IF NOT EXISTS `sms_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `recipient_phone` VARCHAR(20) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pending', 'sent', 'failed', 'delivered') DEFAULT 'pending',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sms_logs_user_id` (`user_id`),
  CONSTRAINT `fk_sms_logs_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔌 Phase 2: Backend API Setup (PHP with MySQLi)

### 2.1 Project Structure
```
backend/
├── config/
│   ├── database.php          # Database connection
│   ├── email.php             # Email configuration
│   └── sms.php              # SMS service configuration
├── controllers/
│   ├── AuthController.php    # Register, login, verification
│   └── NotificationController.php
├── services/
│   ├── AuthService.php       # Business logic
│   ├── EmailService.php      # Email sending
│   ├── SMSService.php        # SMS sending (Twilio/Africa's Talking)
│   └── TokenService.php      # Token generation & validation
├── middleware/
│   ├── Auth.php              # JWT validation
│   └── Validation.php        # Input validation
├── models/
│   ├── User.php
│   ├── Notification.php
│   └── NotificationPreference.php
├── routes.php                # API routing
├── .env.example              # Configuration template
└── index.php                 # Entry point
```

### 2.2 Key Components

#### **Database Connection (config/database.php)**
- MySQLi connection with prepared statements
- Connection pooling
- Error handling

#### **Email Service (services/EmailService.php)**
- PHPMailer library integration
- HTML email templates
- Verification email generation
- Welcome email for new users
- Guest welcome SMS notification trigger

#### **SMS Service (services/SMSService.php)**
- Integration with Twilio or Africa's Talking API
- SMS templates
- Guest user notifications
- Verification code delivery

#### **Auth Service (services/AuthService.php)**
- Password hashing (bcrypt)
- Email verification flow
- Guest registration flow
- Token generation (JWT)

---

## 🎨 Phase 3: Frontend Integration

### 3.1 Register Component Updates (`Register.js`)

**Current Issues**:
- Uses mock data instead of real API
- No email verification flow
- No guest registration option
- No phone field

**Required Changes**:
```jsx
// Add fields for:
// - Phone number (optional for email registration, required for guest)
// - Registration type selector (regular/guest)
// - Email verification step
// - SMS notification checkbox for guests
// - Terms & conditions
```

### 3.2 New Pages/Components Needed

#### **VerifyEmail.js**
- Shows after registration
- Input field for verification code
- Resend verification email button
- Countdown timer for code expiry

#### **GuestRegister.js**
- Simplified form (just phone number)
- SMS consent checkbox
- Instant registration (no email verification)

#### **NotificationPreferences.js**
- Toggle email notifications
- Toggle SMS notifications
- Set notification frequency
- Manage phone number

---

## 📧 Phase 4: Notification Workflows

### 4.1 Regular User Registration Flow

```
User fills registration form (name, email, password)
                ↓
Frontend calls POST /api/auth/register
                ↓
Backend validates input
                ↓
Check if email exists
                ↓
Hash password
                ↓
Create user with is_verified = 0
                ↓
Generate verification token (6-digit code)
                ↓
Send verification email
                ↓
Create email_log entry
                ↓
Return pending verification message to frontend
                ↓
Frontend shows VerifyEmail component
                ↓
User enters verification code
                ↓
Frontend calls POST /api/auth/verify-email
                ↓
Backend validates code & updates is_verified = 1
                ↓
Send welcome email with login instructions
                ↓
Create notification_preferences entry
                ↓
Return JWT token
                ↓
Redirect to dashboard
```

### 4.2 Guest User Registration Flow

```
User enters phone number on GuestRegister form
                ↓
Frontend calls POST /api/auth/register-guest
                ↓
Backend validates phone format
                ↓
Generate guest session token
                ↓
Create user with is_guest = 1, is_verified = 1
                ↓
Send welcome SMS via SMS service
                ↓
Create sms_log entry
                ↓
Create notification with sent_via = 'sms'
                ↓
Return token to frontend
                ↓
Redirect to dashboard
```

### 4.3 Guest User Notifications (During Activity)

```
Guest user downloads/bookmarks/searches
                ↓
Action logged in system
                ↓
Check user notification preferences
                ↓
If sms_notifications = 1:
  - Create notification record
  - Queue SMS message
  - Send via SMS service
  - Update sms_log with status
                ↓
Display in-app notification
```

---

## 🔑 API Endpoints Required

### Authentication
```
POST   /api/auth/register           # Regular user registration
POST   /api/auth/register-guest     # Guest registration
POST   /api/auth/verify-email       # Verify email with code
POST   /api/auth/resend-verification # Resend verification email
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
GET    /api/auth/me                 # Get current user
POST   /api/auth/refresh-token      # Refresh JWT token
```

### Notifications
```
GET    /api/notifications           # Get user notifications
GET    /api/notifications/{id}      # Get single notification
PUT    /api/notifications/{id}      # Mark as read
POST   /api/notification-preferences # Get user preferences
PUT    /api/notification-preferences # Update preferences
```

### Admin/Logging
```
GET    /api/admin/email-logs        # View email delivery logs
GET    /api/admin/sms-logs          # View SMS delivery logs
GET    /api/admin/user/{id}/activity # View user activity
```

---

## 🛠️ Phase 5: Email & SMS Service Setup

### 5.1 Email Configuration
- **Service**: PHPMailer (SMTP)
- **Provider**: Gmail, SendGrid, or Mailgun
- **Templates**: 
  - Verification email with code
  - Welcome email
  - Password reset email
  - Activity notification email

### 5.2 SMS Configuration
- **Service Options**:
  - **Twilio**: International support, reliable
  - **Africa's Talking**: Africa-focused
  - **Nexmo/Vonage**: Global coverage
- **Messages**:
  - Welcome SMS for guests
  - Activity notifications
  - Verification codes (optional)

### 5.3 Configuration (.env)
```
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=multilingual_library

# Email (PHPMailer)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@digitallibrary.com
MAIL_FROM_NAME=Digital Library

# SMS (Twilio)
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=86400  # 24 hours

# Verification
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=900  # 15 minutes
```

---

## 🔄 Phase 6: Complete Integration Sequence

### Step 1: Database Setup
1. Run migration scripts to add new tables and columns
2. Create indices for performance
3. Set up database backups

### Step 2: Backend Development
1. Create PHP project structure
2. Implement database layer (User, Notification models)
3. Implement AuthService and AuthController
4. Implement EmailService and SMSService
5. Create API endpoints with validation
6. Add error handling and logging
7. Test with Postman/Insomnia

### Step 3: Frontend Development
1. Update Register.js with phone field
2. Create VerifyEmail.js component
3. Create GuestRegister.js component
4. Update api.js with new endpoints
5. Add form validation
6. Add loading/error states
7. Test workflows

### Step 4: Testing
1. Email delivery tests
2. SMS delivery tests
3. Verification flow tests
4. Guest registration tests
5. Edge cases (duplicate email, invalid phone, etc.)

### Step 5: Deployment
1. Set up environment variables on XAMPP
2. Configure email/SMS services in production
3. Test end-to-end
4. Monitor logs

---

## 📊 Database Schema Summary

### Modified Tables
| Table | Changes | Purpose |
|-------|---------|---------|
| `users` | Added: phone, is_guest, is_verified, verification_token, last_login | Support guest users & email verification |
| `notifications` | Added: notification_type, sent_via, recipient_phone, delivery_status | Track delivery channels & status |

### New Tables
| Table | Purpose |
|-------|---------|
| `notification_preferences` | User notification settings |
| `email_logs` | Email delivery tracking |
| `sms_logs` | SMS delivery tracking |

---

## 🔐 Security Checklist

- [ ] Hash passwords with bcrypt (cost factor 10+)
- [ ] Use prepared statements for all DB queries
- [ ] Validate all input (email format, phone format, password strength)
- [ ] Implement rate limiting on registration/login endpoints
- [ ] Use HTTPS only
- [ ] Store JWT tokens in httpOnly cookies
- [ ] Implement CSRF protection
- [ ] Sanitize email/SMS content to prevent injection
- [ ] Log authentication attempts
- [ ] Implement account lockout after N failed attempts
- [ ] Use environment variables for sensitive data

---

## 🧪 Testing Scenarios

### Regular User Registration
- ✅ Valid email & password → Success + verification email sent
- ✅ Duplicate email → Error message
- ✅ Weak password → Error message
- ✅ Invalid email format → Error message

### Email Verification
- ✅ Valid code → Account verified
- ✅ Expired code → Error + resend option
- ✅ Invalid code → Error
- ✅ Resend button → New code sent

### Guest Registration
- ✅ Valid phone → Success + SMS sent
- ✅ Invalid phone format → Error
- ✅ Allow immediate access without verification

### Notifications
- ✅ Guest receives SMS after action
- ✅ Email user receives email notification
- ✅ Preferences respected
- ✅ Delivery logs recorded

---

## 📈 Metrics to Track

1. **Registration Success Rate**: Successful registrations / total attempts
2. **Email Delivery Rate**: Delivered / sent
3. **SMS Delivery Rate**: Delivered / sent
4. **Verification Rate**: Verified / registered
5. **Guest Adoption**: Guest registrations / total registrations
6. **Notification Engagement**: Opened / delivered

---

## 🎯 Priority Implementation Order

### Phase 1 (Must Have - Week 1)
1. Database schema modifications
2. Email service setup
3. Regular user registration API
4. Email verification flow
5. Update React Register component

### Phase 2 (Should Have - Week 2)
1. Guest registration API
2. SMS service setup
3. Notification preferences API
4. Email/SMS logging

### Phase 3 (Nice to Have - Week 3)
1. Notification delivery analytics
2. Admin dashboard for logs
3. SMS verification codes
4. Two-factor authentication

---

## 🚀 Quick Start Checklist

- [ ] Create backend directory structure
- [ ] Set up .env file with API keys
- [ ] Import database schema modifications
- [ ] Install PHP dependencies (Composer)
- [ ] Implement User model with MySQLi
- [ ] Implement AuthController.php
- [ ] Test `/api/auth/register` endpoint
- [ ] Set up email service
- [ ] Create email templates
- [ ] Test email sending
- [ ] Update React Register form
- [ ] Create VerifyEmail component
- [ ] End-to-end testing
- [ ] Deploy to XAMPP

