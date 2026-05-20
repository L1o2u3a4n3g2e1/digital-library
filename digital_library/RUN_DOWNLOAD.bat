@echo off
REM Simple launcher for the Node.js book downloader

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║   Download and Organize Project Gutenberg Books            ║
echo ║   21 Free English Books for Your Digital Library           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ✗ ERROR: Node.js is not installed or not in PATH
    echo.
    echo To install Node.js:
    echo   1. Visit: https://nodejs.org/
    echo   2. Download the LTS version
    echo   3. Install it
    echo   4. Restart this script
    echo.
    echo After installing Node.js, come back and run this script again.
    echo.
    pause
    exit /b 1
)

REM Run the downloader script
echo Starting download process...
echo This will download 21 books (~20-30 MB total)
echo Time estimate: 5-15 minutes depending on internet speed
echo.
echo Press any key to start...
pause >nul

cd /d "%~dp0"
node download_and_organize.js

if %errorlevel% equ 0 (
    echo.
    echo ✓ Download complete! All books are ready in their category folders.
    echo.
    echo You can now:
    echo   1. Start your Digital Library system
    echo   2. Browse books by category
    echo   3. Search and read books
    echo   4. Use Text-to-Speech to listen to books
    echo.
) else (
    echo.
    echo ✗ Some books failed to download. See details above.
    echo You can run this script again to retry.
    echo.
)

pause
