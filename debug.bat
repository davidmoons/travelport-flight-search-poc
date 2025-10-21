@echo off
echo Debugging Travelport Flight Search POC...
echo.

echo Current directory: %CD%
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo Node.js is NOT installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
) else (
    echo Node.js is installed
)

echo.
echo Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo npm is NOT available
) else (
    echo npm is available
)

echo.
echo Checking if package.json exists...
if exist package.json (
    echo package.json found
) else (
    echo package.json NOT found
)

echo.
echo Checking if node_modules exists...
if exist node_modules (
    echo node_modules folder exists
) else (
    echo node_modules folder does NOT exist
)

echo.
echo Press any key to continue...
pause >nul

echo.
echo Attempting to install dependencies...
npm install

echo.
echo Press any key to continue...
pause >nul

echo.
echo Attempting to start server...
npm start

echo.
echo Press any key to exit...
pause >nul


