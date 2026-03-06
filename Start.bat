@echo off
echo ========================================
echo   KASET FAIR BOOTH BOOKING SYSTEM (DOCKER)
echo ========================================
echo.
echo Starting all services (Frontend, Backend, DB)...
echo Please wait for the containers to build and start.
echo.

docker compose up --build

echo.
echo ========================================
echo System stopping...
echo ========================================
pause