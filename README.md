![CI](https://github.com/thabang56R/Ai-Powered-Job-Application-Optimizer/actions/workflows/ci.yml/badge.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![OpenAI](https://img.shields.io/badge/OpenAI-Embeddings_%2B_AI-black)
![License](https://img.shields.io/badge/License-MIT-green)


# HireLens — AI Resume Screening + Semantic Ranking (FULLSTACK-project, .NET + React)

# 🚀 HireLens – AI-Powered Job Application Optimizer

HireLens is an enterprise-grade AI recruitment platform designed to modernize hiring through intelligent automation, AI-powered evaluation, and transparent decision-making.

---

## 🌟 Vision

HireLens aims to redefine modern recruitment by combining intelligent automation, AI-driven evaluation, and transparent decision-making into one seamless platform.

The mission is to empower recruiters to make faster, smarter, data-driven hiring decisions while ensuring candidates receive fair, evidence-based evaluations.

By integrating AI scoring, explainability, and structured workflows, HireLens bridges the gap between human intuition and machine intelligence in the hiring ecosystem.

---

## 🌍 Live Demo

**Frontend (Vercel):**  
https://ai-powered-job-application-optimizer-vupphwx74.vercel.app  

**Backend API (Render):**  
https://ai-powered-job-application-optimizer.onrender.com/swagger  

---

## 🏗 Architecture

Frontend (Vercel)  
⬇  
Backend API (Render – Dockerized)  
⬇  
PostgreSQL Database (Render Managed DB)

---

## 🛠 Tech Stack

### Backend
- ASP.NET Core 8  
- Entity Framework Core  
- PostgreSQL (Npgsql)  
- JWT Authentication  
- Swagger  

### Frontend
- React (Vite)  
- Axios  
- JWT Token Storage  

### AI
- OpenAI (Evaluation + Embeddings)

### Infrastructure
- Render (API + Database)  
- Vercel (Frontend)  
- GitHub Actions (CI/CD)  
- Docker  

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication  
- Secure password hashing  
- Role-based access ready  

### 👤 Candidate Management
- Create candidate  
- Update status (New → Shortlisted → Interview → Hired → Rejected)  
- Recruiter notes  
- Audit logging  

### 📄 Resume Upload
- PDF-only upload (15MB max)  
- Text extraction using PdfPig  
- Cleaned text storage  
- Ready for AI evaluation  

### 🤖 AI Evaluation
- OpenAI integration  
- Skill extraction  
- Match scoring  
- Embedding generation  
- Explainability service  

### 📊 Ranking Engine
- Score-based candidate ranking  
- Evaluation tracking  

### 🧾 Audit Trail
Tracks:
- Who changed status  
- Before/After snapshot  
- Timestamp  

---

## 🐳 Docker

Build and run backend container:

```bash
docker build -t hirelens-api .
docker run -p 8080:8080 hirelens-api
```

---

## ⚙️ Environment Variables (Production)

Render backend requires:

```env
ConnectionStrings__DefaultConnection=Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true;

Jwt__Key=VERY_LONG_SECRET_32+_CHARS
Jwt__Issuer=HireLens
Jwt__Audience=HireLens

OpenAI__ApiKey=sk-...
OpenAI__Model=gpt-4o-mini
OpenAI__EmbeddingModel=text-embedding-3-small
```

---

## 🧪 CI/CD

GitHub Actions pipeline includes:
- .NET Restore  
- Build  
- Tests  
- Frontend Build  

---

## 💻 Local Setup (Without Docker)

### Backend

Update `HireLens.Api/appsettings.json`:
- ConnectionStrings:DefaultConnection  
- Jwt:Key (32+ characters)  
- OpenAI:ApiKey (optional)  

Run migrations:

```bash
dotnet ef database update
```

Run API:

```bash
dotnet run --project HireLens.Api
```

Swagger:
```
http://localhost:5159/swagger
```

---

### Frontend

```bash
cd HireLens.Web
npm install
npm run dev
```

---

## 🐳 Docker Compose

From repository root:

```bash
docker compose up --build
```

Web:
```
http://localhost:3000
```

API:
```
http://localhost:8080/swagger
```

---

## 🔑 Key Endpoints

```
POST /api/auth/register
POST /api/auth/login
GET  /api/candidates
POST /api/resumes/upload
POST /api/evaluations/jobs
POST /api/evaluations
GET  /api/rankings/jobs/{jobId}/candidates
GET  /api/rankings/jobs/{jobId}/candidates/{candidateId}/explain
```

---

## 🧪 Tests

```bash
dotnet test
```

---

## 📝 Notes

- If OpenAI key is not configured, evaluation endpoints return a short 400 error.
- PDF extraction works for text-based PDFs. Scanned/image PDFs require OCR.

---

## 📌 Future Improvements

- Role-based authorization (Admin / Recruiter)  
- Resume similarity search  
- Vector database integration  
- Analytics dashboard  
- AI interview question generator  
- Production-grade logging (Serilog)  
- Rate limiting  

---

## 👨‍💻 Author

**Thabang Rakeng**  
Full-Stack Developer | AI-Focused Backend Engineer  
