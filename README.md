# Gemini File Search (RAG) – Demo Collection

**Google just dropped a fully managed RAG system directly into the Gemini API** (Nov 6, 2024) — and it's a game-changer!

**No vector DB. No embedding costs. No chunking code.**
Just upload your files → ask questions → get perfect citations.

### Introducing: **Gemini File Search Tool**
A 100% managed Retrieval-Augmented Generation system built right into the Gemini API.

## 🎯 Choose Your Demo

This repository contains **two complete implementations** showing how to use Google's Gemini File Search API:

### 📊 Demo 1: Python CLI ([`demo1-python/`](demo1-python/))
**Command-line interface with full store management**

- ✅ Create and manage persistent File Search Stores
- ✅ Upload multiple PDFs with metadata
- ✅ Ask questions via CLI with grounded answers
- ✅ Comprehensive store management utility (13 commands)
- ✅ Interactive and batch modes

**Perfect for:** Scripts, automation, data processing pipelines

**Quick Start:**
```bash
cd demo1-python
pip install -r requirements.txt
python3 gemini-rag-zero.py
```

[👉 See full Python demo documentation](demo1-python/README.md)

---

### 🌐 Demo 2: JavaScript Web UI ([`demo2-js/`](demo2-js/))
**Beautiful web interface with drag-and-drop**

- ✨ Modern, responsive web design with gradients
- 🤖 Powered by Gemini 2.5 Pro (most capable model)
- 📄 Drag-and-drop file upload
- 💬 Interactive question/answer interface
- 🎨 Toast notifications and real-time updates

**Perfect for:** Web apps, user-facing tools, interactive demos

**Quick Start:**
```bash
cd demo2-js
npm install
npm start
# Open http://localhost:3000
```

[👉 See full JavaScript demo documentation](demo2-js/README.md)

---

## 🚀 Features (Both Demos)

Both implementations demonstrate:
- ✅ File upload to Gemini File Search
- ✅ Automatic document chunking and embedding
- ✅ RAG-powered question answering with citations
- ✅ Multi-document querying
- ✅ File management (list, delete, clear)

## 🔑 Prerequisites

Both demos require:

1. **Gemini API Key** - [Get one here](https://aistudio.google.com/app/apikey)
2. **Enable the API**:
   ```bash
   gcloud services enable generativelanguage.googleapis.com
   ```

## ⚙️ Setup (Both Demos)

1. **Clone this repository**
2. **Set up your API key**:
   ```bash
   cp .env.example .env
   # Edit .env and add: GEMINI_API_KEY=your-actual-key
   ```
3. **Choose your demo** and follow its README for specific setup

## 📁 Repository Structure

```
gemini-filesearch-rag-zero/
├── demo1-python/           # Python CLI demo
│   ├── gemini-rag-zero.py      # Main demo script
│   ├── manage-filestore.py     # Store management utility
│   ├── requirements.txt        # Python dependencies
│   └── README.md              # Python demo docs
│
├── demo2-js/               # JavaScript Web UI demo
│   ├── server.js              # Express backend
│   ├── package.json           # Node.js dependencies
│   ├── public/                # Frontend files
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── app.js
│   └── README.md             # JavaScript demo docs
│
├── samples/                # Sample PDF files (shared)
├── .env.example           # Environment template
├── .gitignore
└── README.md             # This file
```

## 🎓 How It Works: Automatic RAG Indexing

**Everything is automatic!** When you upload a file to a File Search Store:

1. ✅ **Upload** → File is sent to Google Cloud
2. ✅ **Chunking** → Automatically split into chunks (500 tokens by default)
3. ✅ **Embedding** → Each chunk is embedded (FREE - no cost!)
4. ✅ **Indexing** → Vectors stored in managed vector database (FREE - no cost!)
5. ✅ **Ready** → Immediately queryable (no waiting!)

**You don't need to:**
- ❌ Manually chunk documents
- ❌ Generate embeddings yourself
- ❌ Manage a vector database
- ❌ Trigger indexing
- ❌ Rebuild indexes

**When you upload a file, it's instantly indexed and ready to query.** The entire RAG pipeline is fully managed by Google—just upload and start asking questions!

**What you do pay for:**
- 💰 Indexing embeddings: $0.15 per 1M tokens (one-time at upload)
- 💰 Query tokens: Standard Gemini pricing

**What's FREE:**
- 🆓 Storage (up to 1 GB)
- 🆓 Query-time embeddings
- 🆓 Vector database management

## 🤖 Supported Models

The following Gemini models support File Search:
- **gemini-2.5-pro** - Most capable, best for complex reasoning
- **gemini-2.5-flash** - Faster and more cost-effective (used in this demo)

## Limits & Pricing

**File Size Limits:**
- Maximum file size: **100 MB per document**

**Storage Limits:**
- **Free tier**: Up to **1 GB** free (includes input data + embeddings, typically ~3x your input size)
- **Paid tiers**: 10 GB (Tier 1), 100 GB (Tier 2), 1 TB (Tier 3)

**File Expiration:**
- ⚠️ **Files uploaded to Gemini's File API expire after 48 hours by default**
- This is a temporary storage system - plan accordingly for production use
- Consider re-uploading files if you need long-term access

**Pricing:**
- **Storage**: FREE
- **Embeddings at query time**: FREE
- **Indexing embeddings**: $0.15 per 1M tokens (one-time at upload)
- **Gemini tokens**: Standard pricing (input/output tokens only)

## How RAG Works

**RAG** = Retrieval-Augmented Generation

Traditional AI models only know what they learned during training. With RAG, you provide your own documents and the system:

1. Automatically chunks and embeds your files
2. Stores them in a searchable vector index
3. Finds relevant content when you ask questions
4. Grounds answers in your actual data (reduces hallucinations)

**What Google eliminated**: Before this, you needed to manually parse files, manage chunking strategies, generate embeddings, run vector databases (Pinecone, Weaviate, etc.), and write retrieval code. Now it's all handled by the API.

## Learn More

- 📝 [Phil's JavaScript Tutorial](https://www.philschmid.de/gemini-file-search-javascript) – Comprehensive hands-on guide
- 📢 [Google's Official Announcement](https://blog.google/technology/developers/file-search-gemini-api/)
- 📚 [Official Documentation](https://ai.google.dev/gemini-api/docs/file-search)

## Why This Matters

Google's File Search competes directly with OpenAI's Assistants API file search, but with:
- Simpler implementation
- Often lower costs (free storage + embeddings)
- Works with Gemini 2.5 Pro/Flash (huge context windows)
- Production-ready for enterprise use

Perfect for building AI assistants that need to answer questions about your documents, contracts, reports, knowledge bases, etc.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use in your projects!

---

**Choose your adventure:**
- 🐍 [Python CLI Demo](demo1-python/) - Command-line power user tools
- 🌐 [JavaScript Web UI Demo](demo2-js/) - Beautiful interactive interface

**Built with ❤️ using Google's Gemini File Search API**
