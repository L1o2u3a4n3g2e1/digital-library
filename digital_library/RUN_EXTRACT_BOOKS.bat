@echo off
REM Script to extract and organize uploaded books
REM This runs the PowerShell script with proper permissions

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║      Extracting Your Uploaded Books                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Run the PowerShell script
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0EXTRACT_AND_ORGANIZE_BOOKS.ps1"

echo.
echo Press any key to exit...
pause >nul
