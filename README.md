# AudioTranscribe Pro

React + Vite frontend with an Express backend for secure Gemini audio transcription.

## Prerequisites

- Node.js 18+
- npm

## Local Setup

1. Install frontend dependencies:
   `npm install`
2. Install backend dependencies:
   `cd backend && npm install`
3. Configure frontend env in `.env.local`:
   - `GEMINI_API_KEY=...`
   - `USE_BACKEND=true`
   - `BACKEND_ENDPOINT=http://localhost:3001/api/transcribe`
4. Configure backend env in `backend/.env` (copy from `backend/.env.example`):
   - `GEMINI_API_KEY=...`
   - `FRONTEND_URL=http://localhost:3000`
   - `PORT=3001`

## Run Locally

1. Start backend:
   `cd backend && npm run dev`
2. Start frontend (new terminal):
   `npm run dev`

Frontend: `http://localhost:3000`  
Backend health check: `http://localhost:3001/health`

## Deployment Notes (Cloud Run backend)

- Set `GEMINI_API_KEY` in Cloud Run environment variables.
- Set `FRONTEND_URL` to your deployed frontend origin.
- Cloud Run provides `PORT` automatically.
