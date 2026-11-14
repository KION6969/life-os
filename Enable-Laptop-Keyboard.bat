@echo off
powershell -NoProfile -Command "Start-Process -FilePath powershell.exe -Verb RunAs -Wait -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File','%~dp0enable-internal-keyboard.ps1')"
