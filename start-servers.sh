#!/bin/bash

echo "🚀 Starting Roofund Email App..."

# Kill any existing processes on ports 3001 and 8080
echo "🧹 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true

# Start backend server
echo "📧 Starting backend server (port 3001)..."
cd server && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend server
echo "🌐 Starting frontend server (port 8080)..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Servers started successfully!"
echo "📧 Backend API: http://localhost:3001"
echo "🌐 Frontend App: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to press Ctrl+C
trap 'echo "🛑 Shutting down servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Keep script running
wait