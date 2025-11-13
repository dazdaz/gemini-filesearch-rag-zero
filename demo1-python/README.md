# Demo 1: Python CLI - Gemini File Search RAG

A command-line Python demo showing Google's Gemini File Search capability for Retrieval-Augmented Generation (RAG).

## Features

- ✅ Create a persistent File Search Store
- ✅ Upload multiple PDFs concurrently with metadata
- ✅ Ask questions and get grounded answers with inline citations
- ✅ Comprehensive store management utility
- ✅ Command-line interface

## Quick Start

### Prerequisites

- Python 3.8+ installed
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Navigate to demo folder**
   ```bash
   cd demo1-python
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example env file from parent directory
   cp ../.env.example .env
   
   # Edit .env and add your API key
   # GEMINI_API_KEY=your-actual-api-key-here
   ```

3. **Install dependencies**
   ```bash
   # Using uv (recommended - faster)
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -r requirements.txt
   
   # Or using pip
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Run the demo**
   ```bash
   python3 gemini-rag-zero.py
   ```

## Usage

### Basic Usage

```bash
# Use defaults (samples/ directory from parent, Flash model)
python3 gemini-rag-zero.py

# Use Pro model with custom query
python3 gemini-rag-zero.py -m gemini-2.5-pro -q "Summarize in detail"

# Upload specific files
python3 gemini-rag-zero.py -f ../samples/doc1.pdf ../samples/doc2.pdf

# Ask a custom question
python3 gemini-rag-zero.py -q "What are the main conclusions?"
```

### Store Management

Use the `manage-filestore.py` utility for advanced operations:

```bash
# Create a new store
python3 manage-filestore.py create "My Knowledge Base"

# List all stores
python3 manage-filestore.py list

# Upload files to existing store
python3 manage-filestore.py upload <store-name> file1.pdf file2.pdf

# Query a store
python3 manage-filestore.py query <store-name> "Your question here"

# Get store info
python3 manage-filestore.py info <store-name>

# Delete a store
python3 manage-filestore.py delete <store-name>
```

## Command-Line Options

**Main Demo Script:**
- `-m, --model` - Choose model: `gemini-2.5-flash` (default) or `gemini-2.5-pro`
- `-q, --query` - Ask a specific question instead of default questions
- `-f, --files` - Upload custom PDF files or directory

**Store Management:**
- `create` - Create new File Search Store
- `list` - View all stores and documents
- `upload` - Add files to existing stores
- `query` - Ask questions with RAG
- `info` - Get detailed metadata
- `stats` - Monitor storage usage
- `delete` - Delete stores or documents

## File Structure

```
demo1-python/
├── gemini-rag-zero.py       # Main demo script
├── manage-filestore.py      # Store management utility
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Learn More

See the [main README](../README.md) for detailed information about:
- How RAG works
- Limits & pricing
- API documentation
- Troubleshooting

---

**Part of the Gemini File Search RAG Demo Collection**