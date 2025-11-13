# Demo 2: JavaScript Web UI - Gemini File Search RAG

A beautiful, user-friendly web interface for Google's Gemini File Search API. Upload PDFs and ask questions about their content using Retrieval-Augmented Generation (RAG).

## Features

✨ **Beautiful Web Interface**
- Modern, responsive design with gradient backgrounds
- Drag-and-drop file upload
- Real-time file management
- Toast notifications for feedback

🤖 **Powered by Gemini 2.5 Pro**
- Most capable Gemini model for accurate responses
- Automatic document chunking and embedding
- Grounded answers with source citations
- Multi-document querying

📄 **File Management**
- Upload multiple PDFs simultaneously
- View uploaded documents with metadata
- Delete individual files or clear all
- Storage statistics tracking

💬 **Interactive Querying**
- Pre-built example questions
- Custom question input
- View answers with source references
- Clean, readable response formatting

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Navigate to demo folder**
   ```bash
   cd demo2-js
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file from parent directory
   cp ../.env.example .env
   
   # Edit .env and add your API key
   # GEMINI_API_KEY=your-actual-api-key-here
   ```

4. **Start the server**
   
   **Option 1: Using the startup script (recommended)**
   ```bash
   ./start.sh
   ```
   This script will:
   - Check Node.js installation
   - Verify .env configuration
   - Install dependencies if needed
   - Create required directories
   - Start the server
   
   **Option 2: Using npm directly**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Usage Guide

### 1. Upload Documents

- Click the upload area or drag-and-drop PDF files
- Multiple files can be uploaded at once (max 100MB per file)
- Supported formats: PDF, DOC, DOCX, TXT
- Files are automatically processed and indexed

### 2. Ask Questions

Choose from example questions or write your own:

**Example Questions:**
- "Summarize the main topics covered in the documents"
- "What are the key findings or recommendations?"
- "List any important dates or deadlines mentioned"

**Custom Questions:**
Type any question in the text area and click "Ask"

### 3. View Answers

- Answers are displayed with proper formatting
- Source documents are listed below the answer
- Previous answers remain visible until you clear them

### 4. Manage Files

- View all uploaded documents with their sizes
- Delete individual files using the trash icon
- Clear all files at once with the "Clear All" button

## API Endpoints

The server exposes the following REST API endpoints:

### Health Check
```http
GET /api/health
```

### Upload Files
```http
POST /api/store/upload
Content-Type: multipart/form-data

files: [File, File, ...]
```

### Query Store
```http
POST /api/store/query
Content-Type: application/json

{
  "question": "What is this about?",
  "model": "gemini-2.5-pro" // optional, defaults to gemini-2.5-pro
}
```

### List Files
```http
GET /api/store/files
```

### Delete File
```http
DELETE /api/store/files/:fileName
```

### Clear All Files
```http
POST /api/store/clear
```

## Configuration

### Environment Variables

Create a `.env` file in the demo2-js directory:

```env
GEMINI_API_KEY=your-api-key-here
PORT=3000                          # Optional, defaults to 3000
```

### Server Configuration

Edit [`server.js`](server.js:1) to customize:

- Port number
- Upload limits (default: 100MB per file)
- File types accepted
- Model selection (default: `gemini-2.5-pro`)

## Project Structure

```
demo2-js/
├── server.js              # Express backend server
├── package.json           # Node.js dependencies
├── start.sh              # Startup script (recommended)
├── .env                   # Environment variables (create this)
├── README.md             # This file
├── public/               # Frontend files
│   ├── index.html        # Main HTML page
│   ├── styles.css        # Styling
│   └── app.js            # Frontend JavaScript
└── uploads/              # Temporary upload directory (auto-created)
```

## Technical Details

### Frontend Stack
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Fetch API** - For async HTTP requests

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **Multer** - File upload handling
- **@google/generative-ai** - Gemini API client

### How It Works

1. **File Upload**
   - Files are temporarily stored in `uploads/` directory
   - Uploaded to Gemini File API using FileManager
   - Automatically processed and embedded
   - Local temp files are cleaned up

2. **Document Processing**
   - Gemini automatically chunks documents
   - Creates embeddings for semantic search
   - Stores in managed vector database

3. **Querying**
   - User question is sent to Gemini 2.5 Pro model
   - Model retrieves relevant document chunks
   - Generates answer grounded in uploaded documents
   - Returns answer with source citations

## Limits & Pricing

### File Limits
- Maximum file size: **100 MB per document**
- Recommended total store size: **Under 20 GB** for optimal performance

### Storage Limits
- **Free tier**: Up to **1 GB** (includes input + embeddings, ~3x input size)
- **Paid tiers**: 10 GB, 100 GB, 1 TB available

### Pricing (as of Nov 2024)
- **Storage**: FREE
- **Query-time embeddings**: FREE
- **Indexing embeddings**: $0.15 per 1M tokens (one-time at upload)
- **Gemini API calls**: Standard Gemini pricing

## Development

### Run in Development Mode (with auto-reload)

```bash
npm run dev
```

This uses Node's `--watch` flag to automatically restart on file changes.

### Debugging

Enable detailed logging by setting:
```bash
NODE_ENV=development npm start
```

## Troubleshooting

### "Cannot connect to server"
- Make sure the server is running: `npm start`
- Check that port 3000 is not in use
- Verify firewall settings

### "Upload failed: Invalid API key"
- Check your `.env` file exists in demo2-js directory
- Verify `GEMINI_API_KEY` is set correctly
- Get a new key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### "Query failed: No files uploaded"
- Upload at least one document first
- Check files uploaded successfully (green toast notification)
- Verify files appear in the "Uploaded Documents" section

### Files not processing
- Check file size is under 100MB
- Verify file format is supported (PDF, DOC, DOCX, TXT)
- Check server logs for errors

## Comparison with Python Demo

| Feature | Python Demo | JavaScript Demo |
|---------|------------|-----------------|
| User Interface | CLI | Web UI |
| File Upload | Local files | Drag & drop + file picker |
| Query Input | Command line args | Interactive form |
| Results Display | Terminal | Formatted web page |
| File Management | Script deletion | UI controls |
| Persistence | Optional | Session-based |

## Learn More

- 📝 [Gemini File Search Documentation](https://ai.google.dev/gemini-api/docs/file-search)
- 📢 [Google's Official Announcement](https://blog.google/technology/developers/file-search-gemini-api/)
- 🐍 [Python Demo](../demo1-python/) - CLI version
- 📚 [Main README](../README.md) - Overview of both demos

## License

MIT

## Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
3. Open an issue on GitHub

---

**Part of the Gemini File Search RAG Demo Collection**

**Built with ❤️ using Google's Gemini File Search API**