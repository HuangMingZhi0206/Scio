# Scio - IT Helpdesk RAG Chatbot

<div align="center">

![Scio Logo](https://img.shields.io/badge/Scio-IT%20Helpdesk%20AI-06B6D4?style=for-the-badge&logo=robot&logoColor=white)

**An intelligent IT support chatbot powered by RAG (Retrieval-Augmented Generation)**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Ollama](https://img.shields.io/badge/Ollama-Llama3-7C3AED?style=flat-square)](https://ollama.com)

</div>

---

## 🚀 Features

- **🔧 Smart Troubleshooting** - Step-by-step guidance for WiFi, printer, and software issues
- **📚 Knowledge Base** - Powered by 10,000+ IT documentation articles
- **🔍 Source Citations** - Every answer shows its sources for verification
- **💬 Chat History** - Persistent conversations with SQLite
- **⚡ Real-time Responses** - Powered by local Llama 3 via Ollama
- **🎨 Modern UI** - Glassmorphism design with dark mode

---

## 📋 Prerequisites

Before running the project, ensure you have:

- **Python 3.10+** - [Download Python](https://python.org)
- **Node.js 18+** - [Download Node.js](https://nodejs.org)
- **Ollama** - [Download Ollama](https://ollama.com)

### Install Llama 3 Model

```bash
ollama pull llama3:8b
```

Verify Ollama is running:

```bash
ollama list
```

---

## 📦 Dependencies & Cross-Platform Compatibility

This section ensures the project runs smoothly on any computer.

### Required Versions

| Component   | Required Version | Notes                                                         |
| ----------- | ---------------- | ------------------------------------------------------------- |
| **Python**  | 3.10 - 3.12      | Python 3.13+ may have compatibility issues with some packages |
| **Node.js** | 18.x or 20.x LTS | Use LTS versions for stability                                |
| **npm**     | 9.x or 10.x      | Comes with Node.js                                            |
| **Ollama**  | Latest           | Required for LLM inference                                    |

### Backend Dependencies (Python)

All Python dependencies are pinned to specific versions in `backend/requirements.txt`:

```
fastapi==0.109.2
uvicorn[standard]==0.27.1
langchain==0.1.6
chromadb==0.4.22
sentence-transformers==2.3.1
ollama==0.1.6
# ... and more
```

### Frontend Dependencies (Node.js)

All frontend dependencies are pinned in `frontend/package.json`. The `package-lock.json` file ensures exact versions are installed.

### ⚠️ Troubleshooting Common Dependency Issues

<details>
<summary><strong>🔴 ChromaDB Installation Error (Microsoft Visual C++ 14.0 required)</strong></summary>

This error occurs on Windows when building native extensions:

```
error: Microsoft Visual C++ 14.0 or greater is required
```

**Solution:**

1. Download and install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. During installation, select **"Desktop development with C++"**
3. After installation, restart your terminal and try again:
   ```bash
   pip install -r requirements.txt
   ```

</details>

<details>
<summary><strong>🔴 Package version conflicts</strong></summary>

If you encounter version conflicts:

```bash
# Clear pip cache and reinstall
pip cache purge
pip install -r requirements.txt --force-reinstall
```

</details>

<details>
<summary><strong>🔴 Node.js package issues</strong></summary>

If npm packages fail to install:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

</details>

<details>
<summary><strong>🔴 Sentence-transformers or PyTorch issues</strong></summary>

If sentence-transformers fails to download models:

1. Ensure you have a stable internet connection
2. Check if your firewall blocks Hugging Face URLs
3. Try installing PyTorch separately first:
   ```bash
   pip install torch torchvision torchaudio
   ```

</details>

### 🔄 Regenerating Lock Files (For Developers)

If you update dependencies, regenerate lock files to ensure consistency:

**Backend (Python):**

```bash
cd backend
pip freeze > requirements.txt
```

**Frontend (Node.js):**

```bash
cd frontend
rm package-lock.json
npm install
# This creates a fresh package-lock.json
```

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
cd "c:\Users\ASUS\Documents\Kode Program\ithelpdesk"
```

### 2. Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Setup Frontend

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install
```

---

## ▶️ Running the Application

### Step 1: Start Ollama

Make sure Ollama is running with the Llama 3 model:

```bash
ollama run llama3:8b
```

### Step 2: Ingest Knowledge Base (First time only)

```bash
cd backend
.\venv\Scripts\activate  # If not already activated
python scripts/ingest_data.py
```

This will load all datasets into ChromaDB (takes a few minutes).

### Step 3: Start Backend Server

```bash
cd backend
.\venv\Scripts\activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000
API docs at: http://localhost:8000/docs

### Step 4: Start Frontend Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The UI will be available at: http://localhost:3000

---

## 🎯 Usage

1. Open http://localhost:3000 in your browser
2. Click on a suggestion card or type your question
3. Scio will retrieve relevant information and generate an answer
4. Click on "Sources" to see where the information came from
5. Use 👍/👎 to provide feedback on responses

### Example Questions

- "How do I setup VPN on my laptop?"
- "My printer is showing as offline"
- "What does Windows error 0x0000007E mean?"
- "How do I reset my password?"
- "WiFi keeps disconnecting"

---

## 📁 Project Structure

```
ithelpdesk/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Configuration
│   │   ├── models.py        # Pydantic models
│   │   ├── database.py      # SQLite setup
│   │   ├── routers/         # API endpoints
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── scripts/
│   │   └── ingest_data.py   # Data ingestion
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── package.json
│
└── Dataset/                  # Knowledge base data
```

---

## 🔧 Configuration

Edit `backend/.env` to customize:

```env
# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3:8b

# ChromaDB
CHROMADB_COLLECTION=knowledge_base

# RAG Settings
TOP_K_RESULTS=5        # Number of sources to retrieve
CHUNK_SIZE=800         # Text chunk size
```

---

## 🧪 API Endpoints

| Method | Endpoint                   | Description         |
| ------ | -------------------------- | ------------------- |
| POST   | `/chat`                    | Send a message      |
| GET    | `/chat/conversations`      | List conversations  |
| GET    | `/chat/conversations/{id}` | Get conversation    |
| DELETE | `/chat/conversations/{id}` | Delete conversation |
| POST   | `/chat/feedback`           | Submit feedback     |
| POST   | `/knowledge/ingest/sync`   | Ingest data         |
| GET    | `/knowledge/stats`         | Get KB stats        |
| GET    | `/health`                  | Health check        |

---

## 🎨 Tech Stack

| Layer             | Technology                             |
| ----------------- | -------------------------------------- |
| **LLM**           | Ollama + Llama 3 8B                    |
| **Embeddings**    | sentence-transformers/all-MiniLM-L6-v2 |
| **Vector DB**     | ChromaDB                               |
| **Backend**       | FastAPI + LangChain                    |
| **Frontend**      | Next.js 14 + TypeScript                |
| **Styling**       | Tailwind CSS + Glassmorphism           |
| **UI Components** | Radix UI                               |

---

## 📝 License

This project is for educational purposes - Student Demo Project.

---

<div align="center">
  <p>Built with ❤️ for IT Helpdesk automation</p>
</div>
