import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Disable caching in development mode
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // Disable caching for all responses in development
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    console.log(`🚫 Cache disabled for: ${req.url}`);
    next();
  });
}

// Serve static files with cache control
app.use(express.static('public', {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    if (process.env.NODE_ENV === 'development') {
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
  }
}));

// Request logging middleware (debug mode)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n🌐 [${timestamp}] ${req.method} ${req.url}`);
    console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`   Body:`, JSON.stringify(req.body, null, 2));
    }
    
    // Log response
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`   Response Status: ${res.statusCode}`);
      if (typeof data === 'string' && data.length < 500) {
        console.log(`   Response Data:`, data);
      }
      originalSend.call(this, data);
    };
    
    next();
  });
  console.log('🐛 Debug mode: Request logging enabled\n');
}

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY not found');
  console.error('   Set it via .env file or shell: export GEMINI_API_KEY=your-key');
  process.exit(1);
}

// Show masked key to confirm it's loaded
const maskedKey = apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
console.log(`✅ API Key loaded: ${maskedKey}`);
console.log(`   Key length: ${apiKey.length} characters\n`);

const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

// Store management (in-memory for demo - use database in production)
let currentStore = null;

// Helper function to wait for operation completion
async function waitForOperation(operation) {
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In a real implementation, you'd poll the operation status
  }
  return operation;
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gemini File Search API Demo' });
});

// Create a new file search store
app.post('/api/store/create', async (req, res) => {
  try {
    const { displayName } = req.body;
    
    console.log('📦 Creating File Search Store:', displayName);
    
    // Note: The JavaScript SDK currently doesn't have direct file_search_stores support
    // This is a placeholder - you'll need to use the REST API directly
    // For now, we'll simulate this with file uploads
    
    currentStore = {
      id: `store_${Date.now()}`,
      displayName: displayName || 'Demo Store',
      files: [],
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      store: currentStore
    });
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Helper function to convert documents to text
async function convertDocumentToText(filePath, mimeType, originalName) {
  console.log(`🔄 Converting ${originalName} (${mimeType})...`);
  
  try {
    // Handle Word documents (.docx)
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        originalName.toLowerCase().endsWith('.docx')) {
      console.log('   Converting DOCX to text...');
      const result = await mammoth.extractRawText({ path: filePath });
      return {
        text: result.value,
        convertedMimeType: 'text/plain',
        displayName: originalName.replace(/\.docx$/i, '_converted.txt')
      };
    }
    
    // Handle older Word documents (.doc)
    if (mimeType === 'application/msword' || originalName.toLowerCase().endsWith('.doc')) {
      console.log('   Converting DOC to text...');
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        return {
          text: result.value,
          convertedMimeType: 'text/plain',
          displayName: originalName.replace(/\.doc$/i, '_converted.txt')
        };
      } catch (error) {
        console.warn('   Could not convert .doc file with mammoth, returning as-is');
        return null;
      }
    }
    
    // Handle PDF documents
    if (mimeType === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
      console.log('   Converting PDF to text...');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return {
        text: data.text,
        convertedMimeType: 'text/plain',
        displayName: originalName.replace(/\.pdf$/i, '_converted.txt')
      };
    }
    
    // Return null for unsupported or already supported formats
    return null;
  } catch (error) {
    console.error(`   Error converting ${originalName}:`, error.message);
    return null;
  }
}

// Upload files to the store
app.post('/api/store/upload', upload.array('files', 10), async (req, res) => {
  console.log('🔵 Upload endpoint called');
  console.log(`   Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  console.log(`   Method: ${req.method}`);
  console.log('   Files received:', req.files ? req.files.length : 0);
  
  try {
    if (!req.files || req.files.length === 0) {
      console.log('❌ No files in request');
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    console.log(`📤 Uploading ${req.files.length} file(s)...`);
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      console.log(`   Processing ${file.originalname} (${file.mimetype})...`);
      
      let uploadPath = file.path;
      let uploadMimeType = file.mimetype;
      let uploadDisplayName = file.originalname;
      let tempFile = null;
      
      // Check if conversion is needed
      const conversion = await convertDocumentToText(file.path, file.mimetype, file.originalname);
      
      if (conversion) {
        // Save converted text to a temporary file
        tempFile = path.join('uploads', `temp_${Date.now()}_${conversion.displayName}`);
        fs.writeFileSync(tempFile, conversion.text, 'utf8');
        
        uploadPath = tempFile;
        uploadMimeType = conversion.convertedMimeType;
        uploadDisplayName = conversion.displayName;
        
        console.log(`   ✅ Converted to text: ${uploadDisplayName}`);
      }
      
      // Upload file to Gemini File API
      const uploadResult = await fileManager.uploadFile(uploadPath, {
        mimeType: uploadMimeType,
        displayName: uploadDisplayName,
      });
      
      console.log(`   ✅ Uploaded: ${uploadResult.file.displayName}`);
      
      uploadedFiles.push({
        name: uploadResult.file.name,
        displayName: uploadResult.file.displayName,
        mimeType: uploadResult.file.mimeType,
        uri: uploadResult.file.uri,
        sizeBytes: uploadResult.file.sizeBytes,
        createTime: uploadResult.file.createTime,
        originalName: file.originalname,
        wasConverted: !!conversion
      });
      
      // Clean up local files
      fs.unlinkSync(file.path);
      if (tempFile && fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
    
    // Create store if it doesn't exist
    if (!currentStore) {
      currentStore = {
        id: `store_${Date.now()}`,
        displayName: 'Demo Store',
        files: [],
        createdAt: new Date().toISOString()
      };
      console.log('📦 Auto-created store for uploaded files');
    }
    
    // Store file references
    currentStore.files.push(...uploadedFiles);
    
    console.log(`📊 Store now contains ${currentStore.files.length} file(s)`);
    console.log('   Files in store:', currentStore.files.map(f => f.displayName).join(', '));
    
    res.json({
      success: true,
      files: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    console.error('❌ Error uploading files:', error);
    console.error('   Stack:', error.stack);
    
    // Clean up any uploaded files
    if (req.files) {
      req.files.forEach(file => {
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (e) {
          console.error('Error cleaning up file:', e);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Query the store
app.post('/api/store/query', async (req, res) => {
  try {
    const { question, model = 'gemini-2.5-pro' } = req.body;
    
    console.log('📝 Query endpoint called');
    console.log('   Question:', question);
    console.log('   Model:', model);
    
    if (!question) {
      console.log('❌ No question provided');
      return res.status(400).json({
        success: false,
        error: 'No question provided'
      });
    }
    
    if (!currentStore) {
      console.log('❌ No store exists');
      return res.status(400).json({
        success: false,
        error: 'No store exists. Please upload files first.'
      });
    }
    
    if (currentStore.files.length === 0) {
      console.log('❌ Store is empty');
      console.log('   Current store:', currentStore);
      return res.status(400).json({
        success: false,
        error: 'No files uploaded to query'
      });
    }
    
    console.log(`🔍 Querying with ${currentStore.files.length} file(s): "${question}"`);
    console.log('   Files in store:', currentStore.files.map(f => f.displayName).join(', '));
    
    // Get the generative model
    const generativeModel = genAI.getGenerativeModel({ 
      model: model 
    });
    
    // Prepare file data parts for the prompt
    const fileParts = currentStore.files.map(file => ({
      fileData: {
        fileUri: file.uri,
        mimeType: file.mimeType
      }
    }));
    
    // Create prompt with files
    const result = await generativeModel.generateContent([
      {
        text: `You are a helpful AI assistant. Answer the following question based on the provided documents. If you cite information, mention which document it came from.\n\nQuestion: ${question}`
      },
      ...fileParts
    ]);
    
    const response = result.response;
    const answer = response.text();
    
    console.log('✅ Answer generated');
    
    res.json({
      success: true,
      answer: answer,
      sources: currentStore.files.map(f => f.displayName)
    });
  } catch (error) {
    console.error('Error querying store:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// List uploaded files
app.get('/api/store/files', (req, res) => {
  try {
    const files = currentStore ? currentStore.files : [];
    console.log(`📋 Listing files: ${files.length} file(s) in store`);
    if (files.length > 0) {
      console.log('   Files:', files.map(f => f.displayName).join(', '));
    }
    res.json({
      success: true,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete a file
app.delete('/api/store/files/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    
    if (!currentStore) {
      return res.status(404).json({ 
        success: false, 
        error: 'No store found' 
      });
    }
    
    // Remove from our store
    const fileIndex = currentStore.files.findIndex(f => f.name === fileName);
    if (fileIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: 'File not found' 
      });
    }
    
    const file = currentStore.files[fileIndex];
    
    // Delete from Gemini
    try {
      await fileManager.deleteFile(fileName);
      console.log(`🗑️ Deleted file: ${file.displayName}`);
    } catch (e) {
      console.warn('Warning: Could not delete from Gemini:', e.message);
    }
    
    currentStore.files.splice(fileIndex, 1);
    
    res.json({
      success: true,
      message: `File ${file.displayName} deleted`
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Clear all files
app.post('/api/store/clear', async (req, res) => {
  try {
    if (!currentStore || currentStore.files.length === 0) {
      return res.json({
        success: true,
        message: 'No files to clear'
      });
    }
    
    const fileCount = currentStore.files.length;
    
    // Delete all files from Gemini
    for (const file of currentStore.files) {
      try {
        await fileManager.deleteFile(file.name);
        console.log(`🗑️ Deleted: ${file.displayName}`);
      } catch (e) {
        console.warn(`Warning: Could not delete ${file.displayName}:`, e.message);
      }
    }
    
    currentStore.files = [];
    
    res.json({
      success: true,
      message: `Cleared ${fileCount} file(s)`
    });
  } catch (error) {
    console.error('Error clearing files:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get store info
app.get('/api/store/info', (req, res) => {
  try {
    if (!currentStore) {
      return res.json({
        success: true,
        store: null
      });
    }
    
    const totalSize = currentStore.files.reduce((sum, file) => 
      sum + (parseInt(file.sizeBytes) || 0), 0
    );
    
    res.json({
      success: true,
      store: {
        ...currentStore,
        fileCount: currentStore.files.length,
        totalSizeBytes: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error getting store info:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Gemini File Search Demo Server`);
  console.log(`📍 Server running at http://localhost:${PORT}`);
  console.log(`📁 Open http://localhost:${PORT} in your browser\n`);
  
  // Create uploads directory if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }
});

// Graceful shutdown - clean up files on exit
async function cleanup() {
  console.log('\n🛑 Shutting down server...');
  
  if (currentStore && currentStore.files.length > 0) {
    console.log(`🗑️ Cleaning up ${currentStore.files.length} file(s) from Gemini...`);
    
    for (const file of currentStore.files) {
      try {
        await fileManager.deleteFile(file.name);
        console.log(`   ✅ Deleted: ${file.displayName}`);
      } catch (e) {
        console.warn(`   ⚠️ Could not delete ${file.displayName}: ${e.message}`);
      }
    }
    
    console.log('✅ Cleanup complete');
  } else {
    console.log('✅ No files to clean up');
  }
  
  // Close server
  server.close(() => {
    console.log('👋 Server closed');
    process.exit(0);
  });
  
  // Force exit after 5 seconds
  setTimeout(() => {
    console.error('⚠️ Forcing shutdown...');
    process.exit(1);
  }, 5000);
}

// Handle various shutdown signals
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);  // Ctrl+C
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  cleanup();
});