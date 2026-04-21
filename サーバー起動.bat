@echo off
chcp 65001 > nul
echo.
echo  🍷 ワインオークション サーバーを起動します...
echo.
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" server.js
pause
