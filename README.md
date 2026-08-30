# 🎓 SkillSync — Personal Learning Tracker & AI RAG Knowledge Base

> A full-stack developer learning and productivity platform featuring an end-to-end **Personal Learning RAG (Retrieval-Augmented Generation)** knowledge base powered by React 19, TypeScript, Express, PostgreSQL, and `pgvector`.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.x-336791.svg)](https://www.postgresql.org/)
[![pgvector](https://img.shields.io/badge/pgvector-Supported-blueviolet.svg)](https://github.com/pgvector/pgvector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Key Highlights & Capabilities

### 1. 📚 Personal Learning RAG Knowledge Base
- **Secure File Ingestion**: Upload course slides, technical PDFs, Markdown notes, or text files (up to 10MB) with strict MIME & extension verification.
- **Smart Semantic Chunking**: Dynamically extracts text and partitions documents into 400–800 token semantic chunks with 10% token overlap to preserve contextual boundaries.
- **pgvector Cosine Search**: Generates dense 768-dimensional vector embeddings stored natively in PostgreSQL. Sub-50ms user-scoped vector similarity search.
- **Grounded AI Explanations**: Multi-turn AI Learning Assistant grounded strictly in your personal notes with verified citation badges (document name, page number, section heading, match score).
- **Anti-Prompt Injection**: Uploaded study materials are treated strictly as untrusted data in system prompts to prevent prompt injection and context hijacking.

### 2. ⚡ AI-Powered Study Tools
- **Smart Document Summaries**: Executive overview, key concepts, takeaways, and terminology definitions.
- **Interactive Flashcards**: Active-recall cards with flip animations and card-by-card progress tracking.
- **Adaptive Practice Quizzes**: Generates conceptual and application questions parameterized by difficulty (`EASY`, `MEDIUM`, `HARD`) with answer reveals and explanations.
- **Prioritized Revision Guides**: Categorizes study topics into *High Priority (Master First)*, *Medium Priority (Core Mechanics)*, and *Quick Review (Key Terms)*.
- **Persistent Multi-Turn Chat**: Complete conversational history stored in PostgreSQL with search, chat reopening, and cascade deletion.

### 3. 🎯 Hierarchical Learning Tracker
- **Structured Hierarchy**: Broad ambitions organized into **Goal $\rightarrow$ Skills $\rightarrow$ Topics $\rightarrow$ Tasks**.
- **Dynamic Derived Progress**: Real-time progress metrics computed directly from task completion states with zero drift.
- **Confidence Rating Matrix**: Categorize topic mastery (`NOT_RATED`, `STRONG`, `NEEDS_REVISION`, `WEAK`) to pinpoint knowledge gaps.
- **Deep Analytics**: Workload hours, completion rates, and learning streak visualization.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph INGESTION ["1. Ingestion Pipeline"]
        A[User Uploads PDF/MD/TXT] --> B[Multer File Validation]
        B --> C[Local Secure Storage]
        C --> D[Text Extraction & Page Tracking]
        D --> E[Smart Chunking 400-800 Tokens]
        E --> F[Embedding Generation 768-dim]
        F --> G[(PostgreSQL + pgvector)]
    end

    subgraph RETRIEVAL ["2. Semantic Retrieval Layer"]
        H[User Query / Chat Turn] --> I[Query Vector Embedding]
        I --> J[User-Scoped Cosine Similarity Search]
        G -.-> J
        J --> K[Score Threshold Filter >= 0.35]
        K --> L[Top-K Ranked Relevant Chunks]
    end

    subgraph SYNTHESIS ["3. Grounded Synthesis & AI Tools"]
        L --> M[Controlled Context Assembly]
        M --> N[Anti-Injection Grounded Prompt]
        N --> O[LLM Synthesis Engine]
        O --> P[Grounded Answer + Verified Sources]
        O --> Q[Smart Summaries & Flashcards]
        O --> R[Practice Questions & Revision Plan]
    end

    subgraph PERSISTENCE ["4. Persistent Chat History"]
        P --> S[(rag_conversations & rag_messages)]
        S -.-> T[Recent Turn History Context]
        T -.-> N
    end
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, TanStack Query, React Router v7 |
| **Backend** | Node.js 22, Express.js, TypeScript, Prisma ORM, Multer, pdf-parse |
| **Database** | PostgreSQL 18+ with `pgvector` extension |
| **AI / Embeddings** | Google Gemini API (`gemini-1.5-flash`, `text-embedding-004`), OpenAI API (`gpt-4o-mini`), with a resilient local fallback engine |
| **Security** | Helmet, CORS, bcrypt, JWT (JSON Web Tokens), Anti-IDOR ownership scoping, ErrorBoundary |

---

## 📁 Repository Structure

```text
SkillSync/
├── client/                     # Frontend SPA (React 19 + Vite)
│   ├── src/
│   │   ├── app/                # Router, Providers & AppShell
│   │   ├── components/         # Common UI & ErrorBoundary
│   │   ├── context/            # Auth & Theme Contexts
│   │   ├── features/           # Domain Modules
│   │   │   ├── knowledge/      # Knowledge Base, AI Assistant, Flashcards, Tools
│   │   │   ├── learning/       # Goals, Skills, Topics, Tasks Tree
│   │   │   └── dashboard/      # Metrics, Analytics & Activity
│   │   └── services/           # Typed API Client & RAG API Services
│   └── .env.example            # Frontend environment template
│
├── server/                     # Backend REST API (Express + Prisma)
│   ├── prisma/                 # PostgreSQL Schema & pgvector configuration
│   ├── src/
│   │   ├── config/             # Centralized Env Validator & Prisma Singleton
│   │   ├── controllers/        # REST Controllers (Auth, Docs, RAG, Chat, Goals)
│   │   ├── middleware/         # Auth (JWT), Validation, Error Handler, Logger
│   │   ├── routes/             # API Route Hierarchy
│   │   ├── services/           # Core Business Logic
│   │   │   ├── extraction/     # PDF / Markdown Text Extraction Pipeline
│   │   │   ├── chunking/       # Semantic Text Chunking Service
│   │   │   ├── embedding/      # Vector Embedding Service (Gemini/OpenAI/Local)
│   │   │   ├── retrieval/      # pgvector Cosine Similarity Retrieval
│   │   │   ├── llm/            # LLM Provider Service & Synthesis
│   │   │   ├── ai-learning/    # Summary, Questions, Flashcards & Revision
│   │   │   └── rag-chat/       # Persistent Multi-Turn Conversations
│   │   └── utils/              # Password, JWT, and Math Utilities
│   └── .env.example            # Backend environment template
│
└── docs/                       # Architectural & API Documentation
    ├── RAG_ARCHITECTURE.md     # Deep-dive RAG technical specification
    ├── API_DOCUMENTATION.md    # Complete REST API reference manual
    └── PORTFOLIO_SUMMARY.md    # Resume bullets, elevator pitch & interview walkthrough
```

---

## ⚙️ Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **PostgreSQL**: `v15.0+` with the `vector` extension enabled (`CREATE EXTENSION IF NOT EXISTS vector;`)

### 2. Installation
```bash
git clone https://github.com/yourusername/SkillSync.git
cd SkillSync

# Install dependencies for both client and server
npm install --prefix client
npm install --prefix server
```

### 3. Environment Configuration

#### Backend (`server/.env`):
```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skillsync?schema=public"
JWT_SECRET="replace_with_a_secure_random_key_min_32_chars"
JWT_EXPIRES_IN="7d"

# Optional AI Providers (Falls back to resilient local engine if not set)
GEMINI_API_KEY=""
GEMINI_LLM_MODEL="gemini-1.5-flash"
GEMINI_EMBEDDING_MODEL="text-embedding-004"
```

#### Frontend (`client/.env`):
```ini
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup & Migrations
```bash
cd server
npx prisma db push
npx prisma generate
cd ..
```

### 5. Run Locally
```bash
# Terminal 1: Backend API (http://localhost:5000)
cd server
npm run dev

# Terminal 2: Frontend Client (http://localhost:5173)
cd client
npm run dev
```

---

## 🔒 Security & Multi-Tenant Isolation

1. **Cryptographic JWT Verification**: Bearer tokens are cryptographically validated on every request.
2. **SQL-Level Multi-Tenant Isolation**: Queries strictly scope data by `userId`. User A can never query, retrieve, or infer User B's documents, vector chunks, or conversations.
3. **Prompt Injection Defense**: Retrieved document excerpts are injected into system prompts as untrusted data blocks, preventing malicious document contents from altering AI instructions.
4. **Cascade Integrity**: Deleting goals or conversations cascades cleanly in PostgreSQL, preventing orphaned database records.

---

## 📖 Further Documentation

- [RAG Architecture Deep-Dive](file:///c:/Users/moham/Downloads/SkillSync/docs/RAG_ARCHITECTURE.md)
- [Complete REST API Reference](file:///c:/Users/moham/Downloads/SkillSync/docs/API_DOCUMENTATION.md)
- [Portfolio Summary & Interview Pitch](file:///c:/Users/moham/Downloads/SkillSync/docs/PORTFOLIO_SUMMARY.md)

---

## 📄 License
This project is licensed under the MIT License.
