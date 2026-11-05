@echo off
cd /d "%~dp0"
set PORT=8097
if not "%~1"=="" set PORT=%~1
echo ============================================================
echo  DBATOOLKIT v3.2.0 - OCI PORTAL UI
echo ============================================================
echo Acesse: http://localhost:%PORT%/?v=320
python -m http.server %PORT%
