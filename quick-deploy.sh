#!/bin/bash

echo "🚀 Quick Deploy for Testing"
echo "This will expose your local backend publicly using ngrok"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 Installing ngrok..."
    npm install -g ngrok
fi

# Kill existing processes
echo "🧹 Cleaning up..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "ngrok" 2>/dev/null || true

# Start backend
echo "📧 Starting backend server..."
cd server && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start ngrok
echo "🌐 Starting ngrok tunnel..."
ngrok http 3001 &
NGROK_PID=$!

echo ""
echo "✅ Setup complete!"
echo "📧 Local backend: http://localhost:3001"
echo "🌐 Public backend: Check ngrok output above for public URL"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Copy the ngrok HTTPS URL (e.g., https://abc123.ngrok.io)"
echo "2. Update src/config/api.ts with this URL"
echo "3. Rebuild and test your Lovable app"
echo ""
echo "Press Ctrl+C to stop servers"

# Wait for user to press Ctrl+C
trap 'echo "🛑 Shutting down..."; kill $BACKEND_PID $NGROK_PID 2>/dev/null; exit 0' INT

wait