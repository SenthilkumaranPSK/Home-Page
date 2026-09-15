@echo off
REM Copy the page into the Chrome extension folder and keep sw.js's cache
REM name in sync. Run this after editing config.js (or anything else).
REM
REM   sync.bat          sync everything
REM   sync.bat --check  report what's out of sync, change nothing

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync.ps1" %*
exit /b %errorlevel%
