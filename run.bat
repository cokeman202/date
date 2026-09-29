@echo off
echo ========================================================
echo   Starting Palate & Passport: Couples Dining Journal
echo ========================================================
echo.
cd /d "%~dp0"
start http://localhost:3001
node server/index.js
pause
