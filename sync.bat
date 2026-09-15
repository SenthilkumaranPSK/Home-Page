@echo off
REM Copy the page into the Chrome extension folder.
REM Run this after editing config.js so the New Tab page matches the website.

cd /d "%~dp0"
if not exist "extension\assets" mkdir "extension\assets"

powershell -NoProfile -Command ^
  "(Get-Content 'index.html') | Where-Object { $_ -notmatch 'manifest\.webmanifest' -and $_ -notmatch 'apple-touch-icon' } | ForEach-Object { $_ -replace 'data-page=\"web\"','data-page=\"ext\"' } | Set-Content -Encoding UTF8 'extension\newtab.html'"

copy /Y "styles.css" "extension\" >nul
copy /Y "app.js"     "extension\" >nul
copy /Y "config.js"  "extension\" >nul
copy /Y "cosmos.js"  "extension\" >nul
copy /Y "live.js"    "extension\" >nul
copy /Y "assets\favicon.svg" "extension\assets\" >nul

echo Synced -^> extension\  (reload it at chrome://extensions)
