@echo off
echo Starting Travelport Flight Search POC...
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is available
echo Checking npm availability...
npm --version
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm is not available
    echo.
    pause
    exit /b 1
)

echo.
echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to install dependencies
    echo Please check your internet connection and try again
    echo.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo Starting server...
echo Open your browser and go to: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

REM If npm start fails, pause so user can see the error
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Server failed to start
    echo.
    pause
)
