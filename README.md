![CI](https://github.com/thabang56R/Ai-Powered-Job-Application-Optimizer/actions/workflows/ci.yml/badge.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings_%2B_AI-black)
![License](https://img.shields.io/badge/License-MIT-green)


# HireLens — AI Resume Screening + Semantic Ranking (FULLSTACK-project, .NET + React)

🌟 Vision

HireLens aims to redefine modern recruitment by combining intelligent automation, AI-powered evaluation, and transparent decision-making into a single seamless platform. The vision is to empower recruiters to make faster, smarter, and data-driven hiring decisions while giving candidates a fair, evidence-based evaluation process. By integrating AI scoring, explainability, and structured workflows, HireLens strives to bridge the gap between human intuition and machine intelligence in the hiring ecosystem

🚀** HireLens – AI-Powered Job Application Optimizer**

An enterprise-style AI recruitment platform built with:

ASP.NET Core 8
PostgreSQL (Render)
React + Vite (Vercel)
OpenAI
JWT Authentication
Docker
GitHub Actions CI

  🌍 Live Demo

**Frontend (Vercel):**
https://ai-powered-job-application-optimizer-vupphwx74.vercel.app

  **Backend API (Render):**
https://ai-powered-job-application-optimizer.onrender.com/swagger

  🐳 Docker

Backend runs in container:

docker build -t hirelens-api .
docker run -p 8080:8080 hirelens-api

  🏗 Architecture

Frontend (Vercel)
⬇
Backend API (Render – Dockerized)
⬇
PostgreSQL Database (Render Managed DB

  ⚙️ Environment Variables (Production)

Render Backend requires:
ConnectionStrings__DefaultConnection=Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true;

Jwt__Key=VERY_LONG_SECRET_32+_CHARS
Jwt__Issuer=HireLens
Jwt__Audience=HireLens

OpenAI__ApiKey=sk-...
OpenAI__Model=gpt-4o-mini
OpenAI__EmbeddingModel=text-embedding-3-small

  🧪 CI/CD
  
GitHub Actions:
.NET Restore
Build
Tests

Frontend Build

## Tech Stack
**Backend:** ASP.NET Core, EF Core, SQL Server, JWT Authentication, Npgsql, Swagger 
**Frontend:** React (Vite), Axios, JWT storage 
**AI:** OpenAI (optional for embeddings + evaluation)
**Infrastructure:**Render(API,DB), Vercel(frontend), Github Actions(CI), Docker

---

✨ **Features**

🔐 **Authentication**

JWT-based auth
Secure password hashing
Role-based access ready

👤 **Candidate Management**

Create candidate
Update status (New → Shortlisted → Interview → Hired → Rejected)
Recruiter notes
Audit logging

📄 **Resume Upload**

PDF-only upload (15MB max)
Text extraction using PdfPig
Cleaned text storage
Ready for AI evaluation

🤖 **AI Evaluation**

OpenAI integration
Skill extraction
Match scoring
Embedding generation
Explainability service

📊 **Ranking Engine**

Score-based candidate ranking
Evaluation tracking

🧾 **Audit Trail**

Tracks:

Who changed status
Before/After snapshot
Timestamp

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

📌 Future Improvements

Role-based authorization (Admin / Recruiter)

Resume similarity search

Vector database integration

Analytics dashboard

AI interview question generator

Production-grade logging (Serilog)

Rate limiting

👨‍💻 Author
Thabang Rakeng
Full-Stack Developer | AI-Focused Backend Engineer
