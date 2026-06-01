#!/bin/bash

# Start FastAPI server in the background
echo "Starting FastAPI ML Server..."
cd ml_pipeline
source ../venv/bin/activate
uvicorn serve_models:app --host 127.0.0.1 --port 8000 &
FASTAPI_PID=$!
cd ..

# Start React frontend in background
echo "Starting React Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "================================================="
echo "✅ College Predictor is running!"
echo "React Frontend: http://localhost:5173"
echo "Machine Learning API: http://127.0.0.1:8000"
echo "Press Ctrl+C to stop both servers."
echo "================================================="

# Cleanup background processes on exit
trap "kill $FASTAPI_PID $FRONTEND_PID; exit" INT TERM EXIT

# Wait for background processes to keep script alive
wait
