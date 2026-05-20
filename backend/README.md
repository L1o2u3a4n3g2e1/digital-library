# Digital Library Backend API

REST API for user registration, authentication, and notification system.

## 📋 Prerequisites

- PHP 7.4+
- MySQL/MariaDB
- Composer

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd /path/to/digital-library
composer install
```

This will install:
- **PHPMailer** - For Gmail email sending
- **php-dotenv** - For environment variables
- **firebase/php-jwt** - For JWT token generation

### Step 2: Configure Environment

The `.env` file is already created with Gmail credentials:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=nishiannelou33@gmail.com
MAIL_PASSWORD=rgdz domm xndo idve
MAIL_FROM=nishiannelou33@gmail.com
MAIL_FROM_NAME=Digital Library
```

**Important**: Keep `.env` secure - it's in `.gitignore` so it won't be committed.

### Step 3: Set Up Database

1. Open phpMyAdmin: `http://localhost/phpmyadmin/`
2. Import the database schema from `multilingual_library_schema.sql`
3. Run the new migration scripts (see Database Modifications section)

### Step 4: Create Required Directories

```bash
mkdir -p logs/
mkdir -p uploads/
chmod 755 logs/
chmod 755 uploads/
```

### Step 5: Run the API Server

**Option 1: Using PHP Built-in Server**
```bash
php -S localhost:8000 backend/index.php
```

**Option 2: Using Apache (XAMPP)**
- Place project in `C:\xampp\htdocs\digital-library`
- Access at `http://localhost/digital-library/backend/`

**Option 3: Using Composer Script**
```bash
composer serve
```

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.php       # MySQLi database connection
│   └── email.php          # Email configuration
├── controllers/
│   ├── AuthController.php # Registration, login, verification
│   └── NotificationController.php
├── services/
│   ├── AuthService.php    # Business logic
│   ├── EmailService.php   # Email sending via PHPMailer
│   └── TokenService.php   # JWT token generation
├── models/
│   ├── User.php
│   ├── Notification.php
│   └── NotificationPreference.php
├── helpers/
│   ├── response.php       # JSON response formatting
│   ├── logger.php         # Logging utility
│   └── validation.php     # Input validation
├── index.php              # API entry point
└── README.md              # This file
```

## 🔌 API Endpoints

### Authentication

#### Register User (Email)
```
POST /api/auth/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "0700000000"
}

Response:
{
    "success": true,
    "message": "Registration successful. Please verify your email.",
    "data": {
        "user_id": 1,
        "email": "john@example.com",
        "message": "Verification code sent to your email"
    }
}
```

#### Register Guest (Phone)
```
POST /api/auth/register-guest
Content-Type: application/json

{
    "phone": "0700000000"
}

Response:
{
    "success": true,
    "message": "Guest registration successful",
    "data": {
        "user_id": 2,
        "token": "jwt-token-here",
        "message": "Welcome SMS sent to your phone"
    }
}
```

#### Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
    "email": "john@example.com",
    "verification_code": "123456"
}

Response:
{
    "success": true,
    "message": "Email verified successfully",
    "data": {
        "token": "jwt-token-here",
        "user": { ... }
    }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123!"
}

Response:
{
    "success": true,
    "message": "Login successful",
    "data": {
        "token": "jwt-token-here",
        "user": { ... }
    }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer jwt-token-here

Response:
{
    "success": true,
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        ...
    }
}
```

## 🛡️ Security Features

- ✅ Password hashing with bcrypt
- ✅ Prepared statements (SQL injection protection)
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Input validation
- ✅ Rate limiting ready
- ✅ Environment variable protection

## 📧 Email Configuration

The system uses **Gmail SMTP** via PHPMailer:

```php
// Automatically configured from .env
MAIL_HOST: smtp.gmail.com
MAIL_PORT: 587
MAIL_USERNAME: nishiannelou33@gmail.com
MAIL_PASSWORD: rgdz domm xndo idve
ENCRYPTION: TLS
```

### Email Templates

Templates are stored in `backend/templates/emails/`:
- `verification.html` - Email verification code
- `welcome.html` - Welcome email for new users
- `notification.html` - Activity notification email

## 🧪 Testing Endpoints

### Quick Health Check
```bash
curl http://localhost:8000/api/health
```

### Test Email Sending (requires AuthController)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@1234",
    "phone": "0700000000"
  }'
```

## 📊 Logging

Logs are stored in `logs/app.log` and include:
- API requests
- Authentication events
- Email sending status
- Database errors
- Validation failures

View logs:
```bash
tail -f logs/app.log
```

## 🔄 Database Migrations

Run these SQL commands in phpMyAdmin to add new tables:

### Migration 1: Add Phone & Guest Support
```sql
-- See multilingual_library_database.md for full migration
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL;
ALTER TABLE users ADD COLUMN is_guest TINYINT(1) NOT NULL DEFAULT 0;
```

## 🚨 Troubleshooting

### "SMTP Connect Failed"
- Check Gmail credentials in `.env`
- Ensure 2FA is enabled on Gmail account
- Verify app password is correct (16 characters with spaces)
- Check port 587 is accessible

### "Class PHPMailer not found"
```bash
composer install
```

### "Database Connection Error"
- Verify MySQL is running: `http://localhost/phpmyadmin/`
- Check credentials in `.env`
- Ensure database exists: `multilingual_library`

### "CORS Error"
- Update `ALLOWED_ORIGINS` in `.env`
- Add your frontend URL (e.g., `http://localhost:3000`)

## 📚 Additional Resources

- [PHPMailer Documentation](https://github.com/PHPMailer/PHPMailer)
- [JWT Authentication](https://tools.ietf.org/html/rfc7519)
- [MySQL with PHP](https://www.php.net/manual/en/book.mysqli.php)

## 📝 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | MySQL host |
| `DB_USER` | root | MySQL user |
| `DB_PASSWORD` | (empty) | MySQL password |
| `DB_NAME` | multilingual_library | Database name |
| `MAIL_HOST` | smtp.gmail.com | Email SMTP server |
| `MAIL_PORT` | 587 | Email SMTP port |
| `MAIL_USERNAME` | your-email@gmail.com | Email address |
| `MAIL_PASSWORD` | your-app-password | App password |
| `JWT_SECRET` | (required) | Secret for signing tokens |
| `APP_DEBUG` | false | Enable debug mode |
| `ALLOWED_ORIGINS` | http://localhost:3000 | CORS origins |

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

## 📄 License

Proprietary - Digital Library Project

## 👨‍💻 Author

Digital Library Team - 2026
