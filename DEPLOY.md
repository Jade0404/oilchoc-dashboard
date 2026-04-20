# Deploy Guide

## Backend → Railway

1. Push `backend/` to a GitHub repo
2. In Railway: New Project → Deploy from GitHub → select `backend/` folder
3. Railway auto-detects `railway.toml` — no extra config needed
4. Copy the Railway public URL (e.g. `https://oilchoc-backend.up.railway.app`)

## Frontend → Vercel

1. Push `frontend/` to a GitHub repo  
2. In Vercel: New Project → Import → select `frontend/` folder
3. Add environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://oilchoc-backend.up.railway.app
   ```
4. Deploy — Vercel auto-detects Next.js

## Local development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Dashboard: http://localhost:3000
```

## Environment variables

| Variable | Location | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel | Railway backend URL |
| `PORT` | Railway (auto) | Set automatically |
