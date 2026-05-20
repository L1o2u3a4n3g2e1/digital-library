# 🎯 Composer Installation Guide for Windows + XAMPP

**Status**: Composer not yet installed  
**PHP Available**: ✅ Found at `C:\xampp\php`  
**Next Step**: Install Composer

---

## 🤔 What is Composer?

**Composer** is the PHP package manager - like `npm` for JavaScript or `pip` for Python.

It installs and manages PHP libraries:
- **PHPMailer** (send emails via Gmail)
- **php-dotenv** (manage environment variables)
- **firebase/php-jwt** (generate security tokens)

---

## 📥 Installation Methods

### **Method 1: Download Installer (EASIEST - Recommended)** ⭐

#### Step 1: Download Composer Windows Installer
1. Go to: **https://getcomposer.org/download/**
2. Click: **"Windows Installer"**
3. Download file: `Composer-Setup.exe` (~5 MB)

#### Step 2: Run the Installer
1. Double-click `Composer-Setup.exe`
2. Click "Next"
3. **When asked for PHP path**, provide: `C:\xampp\php\php.exe`
4. Continue clicking "Next"
5. Click "Install"
6. Click "Finish"

#### Step 3: Verify Installation
Open PowerShell and type:
```powershell
composer --version
```

Should show: `Composer version 2.x.x ...`

**Time**: 5 minutes

---

### **Method 2: Manual Installation (ADVANCED)**

#### Step 1: Download composer.phar
```powershell
# Open PowerShell in C:\xampp\php
cd C:\xampp\php

# Download composer.phar
(New-Object System.Net.WebClient).DownloadFile('https://getcomposer.org/composer.phar', 'composer.phar')
```

#### Step 2: Create Batch File
Create file: `C:\xampp\php\composer.bat`

```batch
@echo off
php "%~dp0composer.phar" %*
```

#### Step 3: Add to System PATH
1. Right-click "This PC" → "Properties"
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", find "Path" → Click "Edit"
5. Click "New"
6. Add: `C:\xampp\php`
7. Click "OK" three times

#### Step 4: Verify
```powershell
composer --version
```

**Time**: 10 minutes

---

### **Method 3: Quick Windows Script**

Run this PowerShell script (Run as Administrator):

```powershell
# Set location
cd C:\xampp\php

# Download Composer installer
$ProgressPreference = 'SilentlyContinue'
Invoke-WebRequest -Uri "https://getcomposer.org/Composer-Setup.exe" -OutFile "Composer-Setup.exe"

# Run installer silently
Start-Process "Composer-Setup.exe" -ArgumentList "/SILENT", "/D=C:\xampp\php" -Wait

# Clean up
Remove-Item "Composer-Setup.exe"

# Test installation
composer --version
```

**Time**: 5 minutes

---

## 🚀 Quick Start After Installation

### Step 1: Verify Composer Works
```powershell
cd "C:\Users\BALIA\Desktop\digital-library"
composer --version
```

Should show: `Composer version 2.x.x`

### Step 2: Install Dependencies
```powershell
composer install
```

This will:
- Create `vendor/` folder
- Download PHPMailer
- Download php-dotenv
- Download firebase/php-jwt
- Generate `composer.lock` file

**Output will show**:
```
Installing dependencies from lock file
Verifying lock file contents can be installed on current PHP version.
...
Package Operations: 8 installs, 0 updates, 0 removals
  - Installing phpmailer/phpmailer (v6.8.0)
  - Installing vlucas/phpdotenv (v5.5.0)
  - Installing firebase/php-jwt (v6.4.0)
...
✓ Installation complete
```

**Time**: 1-2 minutes

### Step 3: Verify Installation
```powershell
ls vendor/
```

Should show:
```
autoload.php
composer/
phpmailer/
vlucas/
firebase/
```

### Step 4: Verify vendor/autoload.php exists
```powershell
cat vendor/autoload.php
```

Should show PHP code (proof it was created)

---

## 📋 Step-by-Step: METHOD 1 (Easiest)

### **Option A: GUI Installer (No command line needed)**

1. ✅ Go to https://getcomposer.org/download/
2. ✅ Download **Composer-Setup.exe**
3. ✅ Double-click the file
4. ✅ When asked "Do you want to search for PHP?", click "No"
5. ✅ In "PHP Path" field, enter: `C:\xampp\php\php.exe`
6. ✅ Click "Next" through all screens
7. ✅ Click "Install"
8. ✅ Click "Finish"
9. ✅ Open new PowerShell and type: `composer --version`

**Done!** ✅

### **Option B: Using PowerShell (1 command)**

Open PowerShell as Administrator and paste:

```powershell
# Download and run Composer installer silently
$url = "https://getcomposer.org/Composer-Setup.exe"
$output = "$env:TEMP\Composer-Setup.exe"
(New-Object System.Net.WebClient).DownloadFile($url, $output)
Start-Process $output -ArgumentList "/SILENT", "/D=C:\xampp\php" -Wait
Remove-Item $output
composer --version
```

---

## 🆘 Troubleshooting

### **"composer: command not found"**
- Composer not in system PATH
- **Solution**: Restart PowerShell after installation
- OR add `C:\xampp\php` to PATH manually

### **"PHP executable not found"**
- Wrong PHP path
- **Solution**: Use `C:\xampp\php\php.exe` exactly
- Verify file exists

### **"OpenSSL required"**
- Rarely happens
- **Solution**: Use XAMPP which includes OpenSSL

### **Installer Won't Start**
- Antivirus blocking
- **Solution**: Temporarily disable antivirus or use Method 2

---

## ✅ Verification Checklist

After installation, check all these:

```powershell
# 1. Composer version
composer --version
# Expected: Composer version 2.x.x

# 2. PHP version
composer --check-platform-reqs
# Expected: All requirements met ✓

# 3. Go to project directory
cd "C:\Users\BALIA\Desktop\digital-library"

# 4. Show composer.json
cat composer.json
# Should show: phpmailer, phpdotenv, firebase/php-jwt

# 5. Install dependencies
composer install
# Should download and install 8 packages

# 6. Verify vendor folder
ls vendor/
# Should show: autoload.php, composer/, phpmailer/, vlucas/, firebase/

# 7. Check autoload file
Test-Path "vendor/autoload.php"
# Expected: True
```

---

## 📊 What Gets Installed

When you run `composer install`, you'll get:

```
vendor/
├── autoload.php                 ← PHP auto-loader
├── composer/
│   ├── autoload_classmap.php
│   ├── autoload_namespaces.php
│   ├── installed.php
│   └── installed.json
├── phpmailer/
│   └── phpmailer/              ← Email sending library
├── vlucas/
│   └── phpdotenv/              ← Environment variables
└── firebase/
    └── php-jwt/                ← JSON Web Token generation
```

**Total size**: ~2-3 MB

---

## 🎯 Next Steps After Composer

1. ✅ Install Composer (this guide)
2. ✅ Run `composer install`
3. ✅ Verify `vendor/` folder created
4. ✅ Create `logs/` and `uploads/` directories
5. ✅ Test API with `php -S localhost:8000 backend/index.php`
6. ✅ Test endpoint with `curl http://localhost:8000/api/health`

---

## 📚 Resources

- **Official Composer Website**: https://getcomposer.org
- **Installation Documentation**: https://getcomposer.org/doc/00-intro.md
- **Windows PATH Guide**: https://www.computerhope.com/issues/ch000549.htm
- **XAMPP PHP Location**: `C:\xampp\php`

---

## ⏱️ Estimated Time

| Method | Time | Difficulty |
|--------|------|-----------|
| GUI Installer | 5 min | ⭐ Very Easy |
| PowerShell Script | 5 min | ⭐⭐ Easy |
| Manual Installation | 10 min | ⭐⭐⭐ Medium |

**Recommendation**: Use **GUI Installer** if you prefer clicking, or **PowerShell Script** if you prefer command line.

---

## 🎉 When You're Done

You'll have Composer working and can then run:

```powershell
composer install
```

Which will install:
- ✅ PHPMailer 6.8 (send emails)
- ✅ php-dotenv 5.5 (environment variables)
- ✅ firebase/php-jwt 6.4 (security tokens)

Then proceed to:
- Create logs/ directory
- Create uploads/ directory
- Test the API endpoint
- Build the registration system

---

## 💡 Pro Tips

1. **Add Composer to PATH**: Makes it work from any folder
2. **Use `composer self-update`**: Keep Composer up to date
3. **Check requirements**: `composer --check-platform-reqs`
4. **Update packages**: `composer update` (updates all packages)
5. **Install specific package**: `composer require vendor/package-name`

