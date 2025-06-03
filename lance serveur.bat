@echo off
cd /d %~dp0
python\python.exe -m http.server 8000
