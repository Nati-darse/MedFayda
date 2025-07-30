#!/bin/bash

echo "========================================"
echo "    MedFayda Development Startup"
echo "========================================"
echo

echo "[1/3] Starting PostgreSQL Database..."
echo "Please ensure PostgreSQL is running on localhost:5432"
echo "Database: medfayda"
echo "User: medfayda_user"
echo

echo "[2/3] Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo "[3/3] Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "========================================"
echo "    MedFayda is running!"
echo "========================================"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
