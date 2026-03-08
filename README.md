# Project-DataBase-Practicum (KASET FAIR BOOTH BOOKING SYSTEM)

This project consists of a Flask backend, a React (Vite) frontend, and databases (MySQL & MongoDB), all containerized with Docker.

## Quick Start (Recommended)
If you have **Docker Desktop** installed, you can start the entire system (Frontend, Backend, and Databases) with a single command:

1. edit .env file Username and Password to your MYSQL.
2. Double-click `Start.bat` in the project root.
   - Or run it via terminal: `.\Start.bat`

This will automatically build and start all necessary services using Docker Compose.

---

## Manual Execution (Without Docker)

If you prefer to run services manually:

### 1. Backend
- edit .env file Username and Password to your MYSQL.
- Navigate to the `backend` directory.
- Activate your virtual environment: `venv/bin/activate` (if applicable).
- Set the Flask app: `set FLASK_APP=main.py`
- Run the backend: `flask run --debug`

### 2. Frontend
- Navigate to the `frontend` directory.
- Install dependencies: `npm install`
- Run the development server: `npm run dev`

## Requirements
- **Docker Desktop** (Recommended for the easiest setup)
- Python 3.x (for manual backend execution)
- Node.js (for manual frontend execution)

Python dependencies are listed in the root `requirements.txt`.
Frontend dependencies are managed via `package.json` in the `frontend` directory.
