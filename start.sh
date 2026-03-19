#!/bin/bash

# ZooYorkTimes Scraper Startup Script
# This script starts both the backend (Express) and frontend (React) servers

echo "🚀 Starting ZooYorkTimes Scraper..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Starting MongoDB..."
    brew services start mongodb-community@7.0
    sleep 2
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Make sure to set NYT_API_KEY environment variable."
fi

echo "📦 Starting backend server on port 3003..."
echo "🎨 Starting frontend server on port 3004..."
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3004"
echo "  Backend API: http://localhost:3003/api"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers using the existing npm script
npm start
