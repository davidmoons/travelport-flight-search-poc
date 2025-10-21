#!/bin/bash

# Deployment script for Travelport Flight Search POC

echo "🚀 Deploying Travelport Flight Search POC..."

# Check if required environment variables are set
if [ -z "$TRAVELPORT_USERNAME" ]; then
    echo "❌ Error: TRAVELPORT_USERNAME environment variable not set"
    exit 1
fi

if [ -z "$TRAVELPORT_PASSWORD" ]; then
    echo "❌ Error: TRAVELPORT_PASSWORD environment variable not set"
    exit 1
fi

echo "✅ Environment variables configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the application
echo "🚀 Starting application on port ${PORT:-3000}..."
node server.js
