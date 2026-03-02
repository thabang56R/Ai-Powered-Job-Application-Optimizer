![CI](https://github.com/thabang56R/Ai-Powered-Job-Application-Optimizer/actions/workflows/ci.yml/badge.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings_%2B_AI-black)
![License](https://img.shields.io/badge/License-MIT-green)


# HireLens — AI Resume Screening + Semantic Ranking (FULLSTACK-project, .NET + React)

HireLens is an AI-assisted recruitment tool:
- Upload candidate resume PDFs (text extraction)
- Create job postings
- Run AI evaluation (match score + strengths/missing skills/risks/suggestions + evidence)
- Semantic shortlist ranking using embeddings (resume ↔ job)
- Explainable “Why” panel (matched/missing terms + evidence snippets)
- JWT auth + audit logging

## Tech Stack
**Backend:** ASP.NET Core, EF Core, SQL Server, JWT  
**Frontend:** React (Vite), Axios  
**AI:** OpenAI (optional for embeddings + evaluation)

---

## Features
- ✅ JWT authentication (Swagger has Authorize)
- ✅ Candidates CRUD
- ✅ Jobs CRUD
- ✅ PDF upload + text extraction
- ✅ AI evaluation endpoint
- ✅ Embeddings-based semantic ranking endpoint
- ✅ Explainability endpoint (“Why” panel)
- ✅ Unit tests (xUnit)

---

## Local Setup (without Docker)

### Backend
1. Update `HireLens.Api/appsettings.json`:
   - `ConnectionStrings:DefaultConnection`
   - `Jwt:Key` (32+ chars)
   - `OpenAI:ApiKey` (optional)

2. Run migrations:
```bash
dotnet ef database update

Run API:

dotnet run --project HireLens.Api

API Swagger:

http://localhost:5159/swagger
 (port may differ)

Frontend
cd HireLens.Web
npm install
npm run dev
Docker Compose

From repo root:

docker compose up --build

Web: http://localhost:3000

API: http://localhost:8080/swagger

Key Endpoints

POST /api/auth/register
POST /api/auth/login
GET /api/candidates
POST /api/resumes/upload (multipart form-data: candidateId, file)
POST /api/evaluations/jobs
POST /api/evaluations
GET /api/rankings/jobs/{jobId}/candidates
GET /api/rankings/jobs/{jobId}/candidates/{candidateId}/explain

Tests
dotnet test
Notes

If OpenAI key is not configured, evaluation/embeddings endpoints return a short 400 error.

PDF text extraction works for text-based PDFs (scanned/image PDFs require OCR).

👨‍💻 Author
Thabang Rakeng
Full-Stack Developer | AI-Focused Backend Engineer
