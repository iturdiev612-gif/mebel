@echo off
cd /d "%~dp0"
set "BROWSER="
set "PORT=3000"
node node_modules\react-scripts\scripts\start.js
pause
