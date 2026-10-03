@echo off
title EcoScan Server

cd /d "%~dp0"

echo Starting EcoScan server...
start "" /b py -m http.server 8000

timeout /t 3 /nobreak >nul

echo Opening EcoScan in your default browser...

start "" "http://127.0.0.1:8000/index.html"

exit