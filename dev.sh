#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "Starting VIP Health Card dev environment..."

# Start backend
echo "[backend] Starting Express server on port 3001..."
cd "$ROOT/server"
npm run dev &
BACKEND_PID=$!

# Start frontend
echo "[frontend] Starting Vite dev server..."
cd "$ROOT/prasad-hospitals-app"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  Backend:  http://localhost:3001"
echo "  Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM
wait
