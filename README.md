# AI-Powered Grievance Management Platform

An enterprise-ready civic-tech monorepo for transparent, multi-department grievance intake, AI-assisted routing, duplicate detection, officer workflows, and operational analytics.

## Architecture

- `frontend/` — React, Vite, Tailwind, React Query, Socket.IO client, accessible responsive dashboards.
- `backend/` — Express REST API, MongoDB/Mongoose, JWT access/refresh tokens, RBAC, audit logs, notifications, Socket.IO.
- `ai-service/` — FastAPI inference service with a replaceable multilingual model adapter and deterministic fallback rules.
- `shared/` — taxonomy and API contracts shared across services.
- `deployment/` — Nginx and GitHub Actions deployment assets.
- `docs/` — architecture, API, security, and operations notes.

## Local setup

1. Copy `.env.example` to `.env` and set strong secrets.
2. Start MongoDB locally, or point `MONGO_URI` to MongoDB Atlas.
3. Install JavaScript dependencies with `npm install`.
4. Install AI dependencies with `python -m pip install -r ai-service/requirements.txt`.
5. Start the services: `npm run dev` and `uvicorn app.main:app --reload --port 8000` from `ai-service/`.
6. Seed an admin and departments: `npm run seed`.

The frontend runs on `http://localhost:5173`, backend on `http://localhost:4000`, and AI service on `http://localhost:8000`.

## Production

Use `docker compose up --build` for a complete local production-like stack. Configure Atlas, object storage, SMTP, TLS termination, and secrets through the deployment environment; never commit credentials. Frontend can deploy to Vercel, backend and AI service to Render/AWS, with `deployment/nginx.conf` as the reverse proxy reference.

## Testing

- Backend: `npm run test -w backend`
- Frontend: `npm run test -w frontend`
- AI: `pytest ai-service/tests`

See `docs/API.md`, `docs/ARCHITECTURE.md`, and `docs/SECURITY.md` for contracts and operational guidance.
