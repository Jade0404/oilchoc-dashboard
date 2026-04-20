#!/bin/bash
# Quick-start both servers for local development

echo "Starting backend on :8000 ..."
cd "$(dirname "$0")/backend" && python3 -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Starting frontend on :3000 ..."
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID  |  Frontend PID: $FRONTEND_PID"
echo "Dashboard: http://localhost:3000"
echo "API docs:  http://localhost:8000/docs"
echo "Press Ctrl+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
