@echo off
echo ================================
echo KASET FAIR BOOTH BOOKING SYSTEM
echo ================================

:: ================= BACKEND =================
echo.
echo --- BACKEND SETUP ---
cd backend

:: Create venv if not exist
IF NOT EXIST venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate

echo Installing Python requirements...
:: เติม call ป้องกันการหลุด
call pip install -r requirements.txt

echo Installing python-dotenv for Environment Variables...
call pip install python-dotenv

set FLASK_APP=main.py

echo Starting Flask backend...
start cmd /k flask run --debug

cd ..

:: ================= FRONTEND =================
echo.
echo --- FRONTEND SETUP ---
cd frontend

IF NOT EXIST node_modules (
    echo Installing npm packages...
    call npm install
)

echo Installing PromptPay and QR Code packages...
call npm install promptpay-qr qrcode.react

echo Starting frontend dev server...
start cmd /k npm run dev

cd ..

echo.
echo ================================
echo System is running!
echo ================================
pause