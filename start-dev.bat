@echo off
echo Starting development servers...

:: Start the backend server in a new window
start cmd /k "cd backend && npm run dev"

:: Wait 2 seconds to give the backend time to start
timeout /t 2 /nobreak > nul

:: Start the frontend server in the current window
cd frontend && npm start 