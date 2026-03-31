@echo off
echo rm -f kasetfair_mongo kasetfair_db kasetfair_backend kasetfair_frontend

docker rm -f kasetfair_mongo kasetfair_db kasetfair_backend kasetfair_frontend

echo.
echo ========================================
echo System stopping...
echo ========================================