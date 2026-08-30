# SkillSync — Portfolio Presentation & Technical Summary

## 1. One-Line Project Summary
**SkillSync** is a full-stack developer learning and productivity platform featuring an end-to-end Personal Learning RAG system powered by PostgreSQL, pgvector, and LLM orchestration with verified source attribution.

---

## 2. Key Technical Highlights
- **Full-Stack Architecture**: Modern React 19 SPA with TypeScript, Tailwind CSS, Vite, and an Express.js / Node.js backend.
- **Enterprise-Grade Vector Database**: Native PostgreSQL `pgvector` storing 768-dimensional dense vector embeddings with cosine similarity indexing.
- **Strict Multi-Tenant Isolation**: SQL-level user scoping ensures User A can never retrieve or infer User B's documents, vectors, or chat sessions.
- **Grounded AI Synthesis**: Anti-prompt injection system prompts treat user documents strictly as data, returning verified page numbers, section headers, and similarity scores.
- **On-Demand AI Study Tools**: Generates structured summaries, active-recall flashcards with flip UI, adaptive practice quizzes, and prioritized revision roadmaps.
- **Persistent Conversational Sessions**: PostgreSQL-backed multi-turn chat sessions with automatic cascade deletions and conversational context recall.
- **Zero-Crash Resilience**: Resilient local embedding & synthesis engines ensure uninterrupted developer workflow when external AI API keys are unavailable.

---

## 3. Resume Bullet Points
- **Architected a Full-Stack Personal Learning RAG System** using React 19, TypeScript, Express, PostgreSQL, and `pgvector`, allowing users to index technical study documents and query them with semantic cosine similarity retrieval.
- **Engineered an End-to-End Document Ingestion Pipeline** supporting PDF, Markdown, and TXT parsing, dynamic semantic chunking with 10% token overlap, and batch vector embedding generation.
- **Built Multi-Turn Conversational AI Features & Study Tools** (interactive flashcards, practice quizzes, priority revision guides) with strict prompt injection defenses and verified backend source citations.
- **Implemented Multi-Tenant Security & Concurrency Locks**, ensuring 100% data isolation across database queries and atomic execution locks for document ingestion pipelines.

---

## 4. GitHub Repository Description
> 🚀 Full-stack developer learning and productivity platform with a Personal Knowledge Base RAG system built with React, TypeScript, Node.js, Express, PostgreSQL, and pgvector.

---

## 5. LinkedIn Project Post
```
Excited to share SkillSync — a developer productivity and learning platform featuring a full-stack Personal Learning RAG engine! 📚⚡

With SkillSync, learners can upload technical documentation, course slides, and Markdown study notes to create their own private, indexed knowledge base. 

Key technical aspects:
🔹 Vector Search with PostgreSQL & pgvector for sub-50ms cosine similarity retrieval
🔹 Multi-turn AI Assistant grounded in user notes with verified source citations & page references
🔹 AI Study Tools: active-recall flashcards, adaptive practice questions, and structured revision plans
🔹 Strict multi-tenant data isolation and anti-prompt injection architecture
🔹 Built with TypeScript, React 19, Express, Prisma, and Tailwind CSS

#WebDevelopment #FullStack #TypeScript #ReactJS #NodeJS #PostgreSQL #RAG #AI #MachineLearning #SoftwareEngineering
```

---

## 6. 60-Second Elevator Pitch
"SkillSync is a full-stack learning platform designed to solve the problem of developer information overload. Instead of generic AI chatbots that hallucinate or lack access to your specific coursework and notes, SkillSync integrates a personal Retrieval-Augmented Generation (RAG) knowledge base.

Users upload PDFs, Markdown notes, or text files, which are chunked, converted into 768-dimensional embeddings, and stored in PostgreSQL using pgvector. When learners ask questions or generate study flashcards, the system performs a user-scoped vector similarity search to retrieve relevant excerpts and synthesize grounded explanations with verified page numbers and similarity scores. It delivers private, reliable learning assistance with zero data leakage across users."

---

## 7. 2-Minute Technical Architecture Walkthrough (For Interviews)
"The core architecture of SkillSync is divided into four distinct layers:

1. **Ingestion & Extraction**: When a user uploads a file, Multer validates MIME types and file extensions. Background workers extract text from PDFs or Markdown structures, splitting the content into 400–800 token semantic chunks with a 10% overlap to preserve context across boundaries.

2. **Vector Indexing & Storage**: Each chunk is passed to an embedding model to generate numerical dense vectors stored directly in PostgreSQL using the `pgvector` extension. Documents maintain atomic status state-machines (`UPLOADED` $\rightarrow$ `PROCESSING` $\rightarrow$ `READY` or `FAILED`).

3. **Semantic Retrieval Layer**: When a user asks a question, the query is embedded and matched using cosine distance (`<=>` operator in pgvector). The retrieval query enforces strict user isolation in SQL (`WHERE user_id = $userId AND status = 'READY'`) and applies a relevance threshold to discard noise.

4. **Grounded Synthesis & UI Presentation**: Retrieved chunks are injected into a structured system prompt that instructs the LLM to treat reference notes strictly as data (preventing prompt injections). The response is parsed with verified source citations and displayed in a modern React 19 interface featuring multi-turn conversation memory, flashcard flip animations, and practice quizzes."
