#!/bin/bash

echo "Starting Travelport Flight Search POC..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available"
    exit 1
fi

echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo
echo "Starting server..."
echo "Open your browser and go to: http://localhost:3000"
echo
echo "Press Ctrl+C to stop the server"
echo

npm start


