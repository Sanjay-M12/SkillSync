# SkillSync API Reference Manual

Base URL: `http://localhost:5000/api` (Configurable via `API_PREFIX` and `PORT`)

All protected routes require an `Authorization: Bearer <token>` header obtained via login or registration.

---

## 1. Authentication Endpoints

### `POST /auth/register`
Creates a new user account and returns an authentication JWT token.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "cl...", "name": "Jane Doe", "email": "jane@example.com" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

### `POST /auth/login`
Authenticates existing user credentials.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "user": { "id": "cl...", "name": "Jane Doe", "email": "jane@example.com" },
      "token": "eyJhbGciOi..."
    }
  }
  ```

---

## 2. Document Knowledge Base Endpoints

### `POST /documents/upload`
Uploads and indexes a new learning document (`PDF`, `MD`, or `TXT`).
- **Access**: Protected
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `file`: Binary file (max 10MB)
  - `title`: (Optional) Custom title
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "cm...",
      "title": "React Architecture Notes",
      "originalName": "react_notes.md",
      "fileType": "MD",
      "fileSize": 12450,
      "status": "PROCESSING",
      "totalChunks": 0,
      "createdAt": "2026-08-28T00:00:00.000Z"
    }
  }
  ```

### `GET /documents`
Lists all documents belonging to the authenticated user.
- **Access**: Protected
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "cm...",
        "title": "React Architecture Notes",
        "fileType": "MD",
        "status": "READY",
        "totalChunks": 6,
        "createdAt": "2026-08-28T00:00:00.000Z"
      }
    ]
  }
  ```

### `DELETE /documents/:id`
Deletes an uploaded document, associated chunks, and stored files.
- **Access**: Protected
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully."
  }
  ```

---

## 3. Semantic Vector Search & Grounded Q&A

### `POST /rag/search`
Performs cosine similarity vector search over the user's indexed document chunks.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "query": "How does React Fiber reconciliation work?",
    "documentId": "cm...", // Optional scope
    "topK": 5,             // Default: 5
    "minScore": 0.35       // Default: 0.35
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "query": "How does React Fiber reconciliation work?",
      "totalRetrieved": 3,
      "results": [
        {
          "chunkId": "cm...",
          "content": "React Fiber is a complete rewrite...",
          "score": 0.84,
          "source": {
            "documentId": "cm...",
            "documentName": "React Architecture Notes",
            "documentType": "MD",
            "pageNumber": 1,
            "heading": "Reconciliation Phases"
          }
        }
      ],
      "executionTimeMs": 24,
      "model": "text-embedding-004"
    }
  }
  ```

### `POST /rag/ask`
Generates a grounded explanation using RAG retrieval with verified source attribution.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "question": "What are the two phases of React Fiber?",
    "documentId": "cm..." // Optional
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "question": "What are the two phases of React Fiber?",
      "answer": "React Fiber executes rendering in two distinct phases: 1. Reconciliation Phase (asynchronous and interruptible) and 2. Commit Phase (synchronous and non-interruptible).",
      "hasContext": true,
      "sources": [
        {
          "documentId": "cm...",
          "documentName": "React Architecture Notes",
          "matchScore": 0.86,
          "pageNumber": 1,
          "heading": "Reconciliation Phases"
        }
      ],
      "metadata": {
        "retrievedChunksCount": 2,
        "executionTimeMs": 1450,
        "model": "gemini-1.5-flash"
      }
    }
  }
  ```

---

## 4. AI Learning Tools Endpoints

### `POST /rag/documents/:documentId/summary`
Generates an executive overview, key concepts, takeaways, and key terminology.
- **Access**: Protected
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "data": {
      "documentId": "cm...",
      "documentName": "React Architecture Notes",
      "summary": {
        "overview": "A study document outlining React reconciliation architecture.",
        "keyConcepts": ["Incremental rendering", "Fiber tree nodes"],
        "importantPoints": ["Reconciliation is interruptible", "Commit is synchronous"],
        "keyTerms": [
          { "term": "Fiber Node", "explanation": "A JavaScript object representing a unit of work." }
        ]
      }
    }
  }
  ```

### `POST /rag/documents/:documentId/questions`
Generates structured practice assessment questions.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "count": 5,
    "difficulty": "MEDIUM" // "EASY" | "MEDIUM" | "HARD"
  }
  ```

### `POST /rag/documents/:documentId/flashcards`
Generates active recall flashcards with front/back pairs.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "count": 6
  }
  ```

### `POST /rag/documents/:documentId/revision-suggestions`
Generates prioritized revision guide with High Priority, Medium Priority, and Quick Review tiers.
- **Access**: Protected

---

## 5. Persistent Multi-Turn Conversations

### `GET /rag/conversations`
Lists all chat sessions for the authenticated user.

### `POST /rag/conversations`
Creates a new conversation session.
- **Request Body**:
  ```json
  {
    "title": "Kubernetes Study Session",
    "documentId": "cm..." // Optional
  }
  ```

### `GET /rag/conversations/:id`
Reopens a chat session with full turn history.

### `POST /rag/conversations/:id/messages`
Sends a message, grounds response against reference notes & dialogue turns, and persists turn.
- **Request Body**:
  ```json
  {
    "content": "Explain what the kubelet agent does on each cluster node."
  }
  ```

### `DELETE /rag/conversations/:id`
Deletes conversation and cascades deletion through all turn messages.
