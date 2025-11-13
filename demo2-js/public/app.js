// API Base URL
const API_BASE = window.location.origin;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');
const filesList = document.getElementById('filesList');
const storeInfo = document.getElementById('storeInfo');
const queryForm = document.getElementById('queryForm');
const questionInput = document.getElementById('questionInput');
const queryBtn = document.getElementById('queryBtn');
const answerSection = document.getElementById('answerSection');
const answerContent = document.getElementById('answerContent');
const sourcesSection = document.getElementById('sourcesSection');
const sourcesList = document.getElementById('sourcesList');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');
const toastContainer = document.getElementById('toastContainer');
const exampleQueries = document.querySelectorAll('.example-query');

// State
let selectedFiles = [];
let uploadedFiles = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 App.js v2.0 loaded - Fixed upload button');
    console.log('📍 Initializing Gemini File Search Demo...');
    setupEventListeners();
    loadUploadedFiles();
    
    // Show version in console for debugging
    console.log('✅ Event listeners attached');
    console.log('📋 Upload button should now work');
});

// Setup Event Listeners
function setupEventListeners() {
    console.log('⚙️ Setting up event listeners...');
    
    // Upload area click
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files);
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFileSelect(e.dataTransfer.files);
    });

    // Upload button - add explicit logging with event delegation fix
    if (uploadBtn) {
        console.log('🎯 Attaching upload button click handler');
        console.log('   Button element:', uploadBtn);
        console.log('   Button ID:', uploadBtn.id);
        console.log('   Button disabled:', uploadBtn.disabled);
        console.log('   Button HTML:', uploadBtn.outerHTML);
        
        // Main click handler
        const handleUploadClick = async (e) => {
            console.log('=====================================');
            console.log('🔴 UPLOAD BUTTON CLICKED!');
            console.log('=====================================');
            console.log('   Event type:', e.type);
            console.log('   Target element:', e.target.tagName);
            console.log('   Target:', e.target);
            console.log('   CurrentTarget:', e.currentTarget);
            console.log('   Button disabled state:', uploadBtn.disabled);
            console.log('   Selected files count:', selectedFiles.length);
            
            e.preventDefault();
            e.stopPropagation();
            
            // Don't proceed if button is disabled
            if (uploadBtn.disabled) {
                console.log('⚠️ Button is disabled, not proceeding');
                return;
            }
            
            console.log('📍 Calling uploadFiles()...');
            await uploadFiles();
            console.log('📍 uploadFiles() completed');
        };
        
        // Attach handler to button
        uploadBtn.addEventListener('click', handleUploadClick);
        
        // Also handle clicks on child elements (like the icon span)
        uploadBtn.addEventListener('click', handleUploadClick, true); // Use capture phase
        
        // Alternative: Direct onclick handler as backup
        uploadBtn.onclick = handleUploadClick;
        
        console.log('✅ Upload button handler attached successfully (with event delegation)');
        console.log('   - Standard click listener added');
        console.log('   - Capture phase listener added');
        console.log('   - Direct onclick handler added');
    } else {
        console.error('❌ Upload button not found!');
    }

    // Clear button
    clearBtn.addEventListener('click', clearAllFiles);

    // Query form
    queryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitQuery();
    });

    // Example queries
    exampleQueries.forEach(btn => {
        btn.addEventListener('click', () => {
            questionInput.value = btn.dataset.query;
            questionInput.focus();
        });
    });
}

// Handle File Selection
function handleFileSelect(files) {
    console.log('📁 handleFileSelect called with', files.length, 'file(s)');
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length === 0) {
        uploadBtn.disabled = true;
        return;
    }
    
    console.log('✅ Files selected:', selectedFiles.map(f => f.name).join(', '));

    // Update upload area text
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    placeholder.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <p><strong>${selectedFiles.length}</strong> file(s) selected</p>
        <p class="upload-hint">${selectedFiles.map(f => f.name).join(', ')}</p>
    `;

    uploadBtn.disabled = false;
}

// Upload Files
async function uploadFiles() {
    console.log('=====================================');
    console.log('🚀 UPLOAD FUNCTION CALLED');
    console.log('=====================================');
    console.log('📍 Function entry point reached');
    console.log('📊 State check:');
    console.log('   - selectedFiles array:', selectedFiles);
    console.log('   - selectedFiles.length:', selectedFiles.length);
    console.log('   - Files:', selectedFiles.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
    })));
    
    if (selectedFiles.length === 0) {
        console.error('❌ No files selected - returning early');
        showToast('error', 'No files selected');
        return;
    }

    console.log('✅ Files validation passed');
    console.log('📦 Creating FormData...');
    
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
        console.log(`   [${index}] Adding ${file.name} to FormData`);
        console.log(`        Size: ${file.size} bytes`);
        console.log(`        Type: ${file.type}`);
        formData.append('files', file);
    });

    // Debug FormData contents
    console.log('📋 FormData entries:');
    for (let [key, value] of formData) {
        console.log(`   - ${key}: ${value.name || value}`);
    }

    showLoading('Uploading files...');
    
    const uploadUrl = `${API_BASE}/api/store/upload`;
    console.log('🌐 Upload details:');
    console.log('   - API_BASE:', API_BASE);
    console.log('   - Full URL:', uploadUrl);
    console.log('   - Method: POST');
    console.log('   - Body: FormData with files');

    try {
        console.log('📤 Initiating fetch request...');
        const startTime = Date.now();
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        const elapsed = Date.now() - startTime;
        console.log(`📥 Response received in ${elapsed}ms`);
        console.log('   - Status:', response.status);
        console.log('   - StatusText:', response.statusText);
        console.log('   - Headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('📦 Response JSON:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('=====================================');
            console.log('✅ UPLOAD SUCCESSFUL!');
            console.log('=====================================');
            console.log('   - Files uploaded:', data.count);
            console.log('   - Store name:', data.storeName);
            
            // Check if any files were converted
            const convertedFiles = data.files?.filter(f => f.wasConverted) || [];
            if (convertedFiles.length > 0) {
                showToast('success', `Successfully uploaded ${data.count} file(s)! ${convertedFiles.length} document(s) were converted to text for processing.`);
            } else {
                showToast('success', `Successfully uploaded ${data.count} file(s)!`);
            }
            
            // Clear selection
            console.log('🧹 Clearing selection...');
            selectedFiles = [];
            fileInput.value = '';
            
            // Reset upload area
            const placeholder = uploadArea.querySelector('.upload-placeholder');
            if (placeholder) {
                console.log('🔄 Resetting upload area UI...');
                placeholder.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p>Click to upload or drag & drop</p>
                    <p class="upload-hint">PDF, DOC, DOCX, TXT, and more (max 100MB per file)</p>
                    <p class="upload-hint" style="font-size: 0.85em; margin-top: 5px;">Word & PDF documents will be automatically converted to text</p>
                `;
            }
            
            uploadBtn.disabled = true;
            console.log('🔄 Reloading uploaded files list...');
            await loadUploadedFiles();
            console.log('✅ Upload process complete');
        } else {
            console.log('=====================================');
            console.error('❌ UPLOAD FAILED');
            console.log('=====================================');
            console.error('   - Error:', data.error);
            console.error('   - Details:', data.details);
            console.error('   - Full response:', data);
            
            showToast('error', `Upload failed: ${data.error}`);
        }
    } catch (error) {
        console.log('=====================================');
        console.error('❌ UPLOAD EXCEPTION');
        console.log('=====================================');
        console.error('   - Message:', error.message);
        console.error('   - Name:', error.name);
        console.error('   - Stack:', error.stack);
        
        showToast('error', `Upload error: ${error.message}`);
    } finally {
        console.log('🏁 Upload function cleanup');
        hideLoading();
    }
    
    console.log('=====================================');
    console.log('📍 Upload function exit');
    console.log('=====================================');
}

// Load Uploaded Files
async function loadUploadedFiles() {
    try {
        console.log('🔄 Loading uploaded files...');
        const response = await fetch(`${API_BASE}/api/store/files`);
        const data = await response.json();

        console.log('📦 Server response:', data);

        if (data.success) {
            uploadedFiles = data.files;
            console.log(`✅ Loaded ${uploadedFiles.length} file(s)`);
            if (uploadedFiles.length > 0) {
                console.log('   Files:', uploadedFiles.map(f => f.displayName).join(', '));
            }
            renderFilesList();
            updateStoreInfo();
            updateQueryUI();
        }
    } catch (error) {
        console.error('❌ Error loading files:', error);
    }
}

// Render Files List
function renderFilesList() {
    console.log(`🎨 Rendering ${uploadedFiles.length} file(s)`);
    
    if (uploadedFiles.length === 0) {
        console.log('   Showing empty state');
        filesList.innerHTML = `
            <div class="empty-state">
                <p>No documents uploaded yet</p>
            </div>
        `;
        clearBtn.style.display = 'none';
        return;
    }
    
    console.log('   Rendering file list');

    filesList.innerHTML = uploadedFiles.map(file => {
        const sizeKB = (parseInt(file.sizeBytes) / 1024).toFixed(1);
        return `
            <div class="file-item fade-in">
                <div class="file-info">
                    <div class="file-icon">📄</div>
                    <div class="file-details">
                        <div class="file-name">${file.originalName || file.displayName}</div>
                        <div class="file-meta">
                            ${sizeKB} KB
                            ${file.wasConverted ? '<span style="color: #4CAF50; margin-left: 8px;">✓ Converted</span>' : ''}
                        </div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn-icon-only" onclick="deleteFile('${file.name}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');

    clearBtn.style.display = 'inline-flex';
}

// Update Store Info
function updateStoreInfo() {
    if (uploadedFiles.length === 0) {
        storeInfo.style.display = 'none';
        return;
    }

    const totalSize = uploadedFiles.reduce((sum, file) => 
        sum + parseInt(file.sizeBytes || 0), 0
    );
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

    storeInfo.style.display = 'block';
    storeInfo.innerHTML = `
        <p><strong>📊 Store Statistics</strong></p>
        <p>Total Documents: ${uploadedFiles.length}</p>
        <p>Total Size: ${totalMB} MB</p>
    `;
}

// Update Query UI
function updateQueryUI() {
    const hasFiles = uploadedFiles.length > 0;
    questionInput.disabled = !hasFiles;
    queryBtn.disabled = !hasFiles;

    if (hasFiles) {
        questionInput.placeholder = 'Ask anything about your uploaded documents...';
    } else {
        questionInput.placeholder = 'Upload documents first to start asking questions...';
    }
}

// Delete File
async function deleteFile(fileName) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    showLoading('Deleting file...');

    try {
        const response = await fetch(`${API_BASE}/api/store/files/${encodeURIComponent(fileName)}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast('success', data.message);
            await loadUploadedFiles();
            
            // Clear answer if no files left
            if (uploadedFiles.length === 0) {
                answerSection.style.display = 'none';
            }
        } else {
            showToast('error', `Delete failed: ${data.error}`);
        }
    } catch (error) {
        showToast('error', `Delete error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Make deleteFile available globally
window.deleteFile = deleteFile;

// Clear All Files
async function clearAllFiles() {
    if (!confirm(`Are you sure you want to delete all ${uploadedFiles.length} file(s)?`)) {
        return;
    }

    showLoading('Clearing all files...');

    try {
        const response = await fetch(`${API_BASE}/api/store/clear`, {
            method: 'POST'
        });

        const data = await response.json();

        if (data.success) {
            showToast('success', data.message);
            await loadUploadedFiles();
            answerSection.style.display = 'none';
        } else {
            showToast('error', `Clear failed: ${data.error}`);
        }
    } catch (error) {
        showToast('error', `Clear error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Submit Query
async function submitQuery() {
    const question = questionInput.value.trim();
    
    if (!question) {
        showToast('error', 'Please enter a question');
        return;
    }

    if (uploadedFiles.length === 0) {
        showToast('error', 'Please upload documents first');
        return;
    }

    showLoading('Generating answer...');
    answerSection.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/api/store/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();

        if (data.success) {
            displayAnswer(data.answer, data.sources);
            showToast('success', 'Answer generated!');
        } else {
            showToast('error', `Query failed: ${data.error}`);
        }
    } catch (error) {
        showToast('error', `Query error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Display Answer
function displayAnswer(answer, sources) {
    answerContent.textContent = answer;
    answerSection.style.display = 'block';
    
    if (sources && sources.length > 0) {
        sourcesList.innerHTML = sources.map(source => 
            `<li>📄 ${source}</li>`
        ).join('');
        sourcesSection.style.display = 'block';
    } else {
        sourcesSection.style.display = 'none';
    }

    // Smooth scroll to answer
    answerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show Loading
function showLoading(text = 'Processing...') {
    loadingText.textContent = text;
    loadingOverlay.style.display = 'flex';
}

// Hide Loading
function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// Show Toast
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Health Check
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        console.log('Server status:', data);
    } catch (error) {
        console.error('Server connection error:', error);
        showToast('error', 'Cannot connect to server. Please make sure the server is running.');
    }
}

// Check server health on load
checkHealth();

// Diagnostic function for debugging
window.debugUpload = function() {
    console.log('=== UPLOAD DEBUG INFO ===');
    console.log('Upload button:', uploadBtn);
    console.log('Upload button disabled:', uploadBtn?.disabled);
    console.log('File input:', fileInput);
    console.log('Selected files:', selectedFiles);
    console.log('Selected files count:', selectedFiles.length);
    
    if (selectedFiles.length > 0) {
        console.log('Files details:');
        selectedFiles.forEach((file, i) => {
            console.log(`  [${i}] ${file.name} - ${file.size} bytes - ${file.type}`);
        });
    }
    
    // Test upload button
    if (uploadBtn) {
        console.log('Testing upload button...');
        console.log('  - Button exists: YES');
        console.log('  - Button ID:', uploadBtn.id);
        console.log('  - Button disabled:', uploadBtn.disabled);
        console.log('  - Button onclick:', uploadBtn.onclick);
        
        // Check event listeners
        const listeners = getEventListeners ? getEventListeners(uploadBtn) : null;
        if (listeners) {
            console.log('  - Event listeners:', listeners);
        }
    } else {
        console.log('ERROR: Upload button not found!');
    }
    
    return {
        uploadBtn: uploadBtn,
        selectedFiles: selectedFiles,
        canUpload: selectedFiles.length > 0 && !uploadBtn?.disabled
    };
};

// Manual upload trigger for testing
window.triggerUpload = async function() {
    console.log('=== MANUAL UPLOAD TRIGGER ===');
    if (selectedFiles.length === 0) {
        console.error('No files selected! Select a file first.');
        return;
    }
    console.log('Calling uploadFiles() directly...');
    await uploadFiles();
};

// Test file selection
window.testFileSelect = function() {
    console.log('=== TEST FILE SELECT ===');
    console.log('Triggering file input click...');
    fileInput.click();
};

console.log('🔧 Debug functions available:');
console.log('  - debugUpload() : Check upload state');
console.log('  - triggerUpload() : Manually trigger upload');
console.log('  - testFileSelect() : Open file selector');