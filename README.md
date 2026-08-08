<div align="center">

# 🏛️ AI-Powered Grievance Management Platform

**Enterprise-ready civic-tech platform for transparent, AI-assisted grievance management**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Issues](https://img.shields.io/github/issues/jethwa76/ai-powered-grievance-management-platform?style=flat-square)](https://github.com/jethwa76/ai-powered-grievance-management-platform/issues)

*Multi-department grievance intake · AI routing · Duplicate detection · Officer workflows · Operational analytics*

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI-Assisted Routing** | Multilingual NLP model auto-routes grievances to the correct department |
| 🔍 **Duplicate Detection** | Sentence-transformer embeddings identify and merge duplicate complaints |
| 🏢 **Multi-Department Workflows** | Role-based officer dashboards for intake, escalation, and resolution |
| 📊 **Operational Analytics** | Real-time charts and KPI dashboards powered by Recharts |
| 🔔 **Live Notifications** | Socket.IO push notifications for status changes and assignments |
| 🔐 **Enterprise Security** | JWT access/refresh tokens, RBAC, audit logs, Helmet, rate-limiting |
| 📎 **File Attachments** | Multer-powered document and image uploads for evidence |
| 🌐 **Accessible UI** | WCAG-compliant, responsive dashboards with Framer Motion animations |

---

## 🏗️ Architecture

```
ai-powered-grievance-management-platform/
├── frontend/          # React 18 · Vite · Tailwind CSS · React Query · Socket.IO
├── backend/           # Express · MongoDB/Mongoose · JWT · RBAC · Socket.IO
├── ai-service/        # FastAPI · sentence-transformers · scikit-learn · Transformers
├── shared/            # Taxonomy and API contracts shared across services
├── deployment/        # Nginx config · GitHub Actions CI/CD assets
└── docs/              # Architecture · API · Security · Operations notes
```

```
Browser ──▶ React (Vite) ──▶ Express API ──▶ MongoDB
                                  │
                                  └──▶ FastAPI AI Service
                                            │
                                  sentence-transformers / scikit-learn
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:4000 |
| AI Service | http://localhost:8000 |

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![React Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white&style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-EF0089?logo=framer&logoColor=white&style=flat-square)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socketdotio&logoColor=white&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-2-22C55E?style=flat-square)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=white&style=flat-square)
![Mongoose](https://img.shields.io/badge/Mongoose-8-880000?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white&style=flat-square)
![Zod](https://img.shields.io/badge/Zod-3-3E67B1?style=flat-square)

### AI Service
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white&style=flat-square)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white&style=flat-square)
![HuggingFace](https://img.shields.io/badge/Transformers-4.47-FFD21E?logo=huggingface&logoColor=black&style=flat-square)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6-F7931E?logo=scikitlearn&logoColor=white&style=flat-square)

### Infrastructure
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white&style=flat-square)
![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white&style=flat-square)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?logo=githubactions&logoColor=white&style=flat-square)

---

## 🚀 Local Setup

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Python** ≥ 3.11
- **MongoDB** (local) or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **Docker** (optional, for full-stack containerized run)

### 1 — Clone and install

```bash
git clone https://github.com/jethwa76/ai-powered-grievance-management-platform.git
cd ai-powered-grievance-management-platform
npm install
```

### 2 — Configure environment

```bash
# Root
cp .env.example .env

# Backend
cp backend/.env.example backend/.env

# AI Service
cp ai-service/.env.example ai-service/.env
```

Open each `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Strong random secret for access tokens |
| `JWT_REFRESH_SECRET` | Strong random secret for refresh tokens |
| `AI_SERVICE_URL` | URL of the FastAPI AI service (default `http://localhost:8000`) |

### 3 — Install AI service dependencies

```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

### 4 — Seed the database

```bash
npm run seed
```

This creates an admin user and default departments. Check the seed script output for credentials.

### 5 — Start all services

```bash
# Start frontend + backend concurrently
npm run dev

# In a separate terminal, start the AI service
cd ai-service
uvicorn app.main:app --reload --port 8000
```

Open **http://localhost:5173** in your browser.

---

## 🐳 Docker (Production-like)

```bash
docker compose up --build
```

This starts all three services plus Nginx in isolated containers. The Nginx config in `deployment/nginx.conf` acts as the reverse proxy.

> **Note:** Configure Atlas, SMTP, object storage, TLS termination, and secrets through environment variables. **Never commit credentials to version control.**

---

## 🧪 Testing

```bash
# All tests
npm run test

# Backend only
npm run test -w backend

# Frontend only
npm run test -w frontend

# AI service
pytest ai-service/tests
```

---

## 📁 Project Structure

<details>
<summary>Click to expand full tree</summary>

```
├── frontend/src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── hooks/         # Custom React hooks
│   └── lib/           # API client, utilities
│
├── backend/src/
│   ├── routes/        # Express route handlers
│   ├── models/        # Mongoose schemas
│   ├── middleware/     # Auth, RBAC, validation
│   ├── services/      # Business logic & AI integration
│   └── scripts/       # Database seed scripts
│
├── ai-service/app/
│   ├── routers/       # FastAPI endpoint routers
│   ├── models/        # Pydantic request/response models
│   └── services/      # NLP inference & embedding logic
│
└── shared/
    └── taxonomy/      # Department categories & status enums
```

</details>

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [`docs/API.md`](docs/API.md) | REST API contracts and endpoint reference |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design and service interaction diagrams |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Security model, RBAC roles, and audit logging |

---

## 🚢 Deployment

| Service | Recommended Platform |
|---------|---------------------|
| Frontend | [Vercel](https://vercel.com) / [Netlify](https://netlify.com) |
| Backend | [Render](https://render.com) / AWS ECS / Railway |
| AI Service | [Render](https://render.com) / AWS ECS / Fly.io |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) |

Use `deployment/nginx.conf` as the reverse proxy reference for self-hosted setups.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for civic transparency and accessible public services

⭐ Star this repo if you find it useful!

</div>
