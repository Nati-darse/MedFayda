@echo off
echo ========================================
echo    MedFayda Development Startup
echo ========================================
echo.

echo [1/3] Starting PostgreSQL Database...
echo Please ensure PostgreSQL is running on localhost:5432
echo Database: medfayda
echo User: medfayda_user
echo.

echo [2/3] Starting Backend Server...
cd backend
start "MedFayda Backend" cmd /k "npm start"
cd ..

echo [3/3] Starting Frontend Server...
cd frontend
start "MedFayda Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo    MedFayda is starting up!
echo ========================================
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to exit...
pause > nul
