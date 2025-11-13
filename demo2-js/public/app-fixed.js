// API Base URL
const API_BASE = window.location.origin;

// DOM Elements - will be initialized after DOM is ready
let uploadArea, fileInput, uploadBtn, clearBtn, filesList, storeInfo;
let queryForm, questionInput, queryBtn, answerSection, answerContent;
let sourcesSection, sourcesList, loadingOverlay, loadingText;
let toastContainer, exampleQueries;

// State
let selectedFiles = [];
let uploadedFiles = [];

// Initialize only after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('========================================');
    console.log('🚀 App Fixed v3.0 - Complete Rewrite');
    console.log('========================================');
    
    // Initialize DOM elements
    initializeDOMElements();
    
    // Setup event listeners with fixes
    setupFixedEventListeners();
    
    // Load existing files
    loadUploadedFiles();
    
    // Health check
    checkHealth();
    
    console.log('✅ Initialization complete');
});

function initializeDOMElements() {
    console.log('📍 Initializing DOM elements...');
    
    uploadArea = document.getElementById('uploadArea');
    fileInput = document.getElementById('fileInput');
    uploadBtn = document.getElementById('uploadBtn');
    clearBtn = document.getElementById('clearBtn');
    filesList = document.getElementById('filesList');
    storeInfo = document.getElementById('storeInfo');
    queryForm = document.getElementById('queryForm');
    questionInput = document.getElementById('questionInput');
    queryBtn = document.getElementById('queryBtn');
    answerSection = document.getElementById('answerSection');
    answerContent = document.getElementById('answerContent');
    sourcesSection = document.getElementById('sourcesSection');
    sourcesList = document.getElementById('sourcesList');
    loadingOverlay = document.getElementById('loadingOverlay');
    loadingText = document.getElementById('loadingText');
    toastContainer = document.getElementById('toastContainer');
    exampleQueries = document.querySelectorAll('.example-query');
    
    // Verify critical elements
    if (!uploadBtn) {
        console.error('❌ CRITICAL: Upload button not found!');
    } else {
        console.log('✅ Upload button found:', uploadBtn);
    }
}

function setupFixedEventListeners() {
    console.log('⚙️ Setting up FIXED event listeners...');
    
    // Upload area click
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', (e) => {
            // Don't trigger if clicking on the upload button
            if (e.target.closest('#uploadBtn')) return;
            fileInput.click();
        });
        console.log('✅ Upload area listener attached');
    }

    // File input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            handleFileSelect(e.target.files);
        });
        console.log('✅ File input listener attached');
    }

    // Drag and drop
    if (uploadArea) {
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
        console.log('✅ Drag-drop listeners attached');
    }

    // CRITICAL: Upload button with comprehensive fixes
    if (uploadBtn) {
        console.log('🎯 Setting up upload button with fixes...');
        
        // Remove any existing handlers
        const newBtn = uploadBtn.cloneNode(true);
        uploadBtn.parentNode.replaceChild(newBtn, uploadBtn);
        uploadBtn = newBtn; // Update reference
        
        // Single comprehensive handler
        uploadBtn.addEventListener('click', function(e) {
            console.log('=====================================');
            console.log('🔴 UPLOAD BUTTON CLICKED (FIXED)');
            console.log('=====================================');
            
            // Prevent any form submission or bubbling
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Check if button is disabled
            if (this.disabled) {
                console.log('⚠️ Button is disabled');
                return false;
            }
            
            // Check if we have files
            if (selectedFiles.length === 0) {
                console.log('⚠️ No files selected');
                showToast('error', 'Please select files first');
                return false;
            }
            
            console.log(`📤 Uploading ${selectedFiles.length} file(s)`);
            
            // Call upload function
            performUpload();
            
            return false; // Extra prevention
        }, false);
        
        console.log('✅ Upload button handler attached (with all fixes)');
    }

    // Clear button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFiles);
        console.log('✅ Clear button listener attached');
    }

    // Query form
    if (queryForm) {
        queryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitQuery();
        });
        console.log('✅ Query form listener attached');
    }

    // Example queries
    exampleQueries.forEach(btn => {
        btn.addEventListener('click', () => {
            questionInput.value = btn.dataset.query;
            questionInput.focus();
        });
    });
    if (exampleQueries.length > 0) {
        console.log('✅ Example query listeners attached');
    }
}

// Simplified upload function
async function performUpload() {
    console.log('🚀 performUpload() called');
    console.log(`   Files to upload: ${selectedFiles.length}`);
    
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
        console.log(`   [${index}] ${file.name} (${file.size} bytes)`);
        formData.append('files', file);
    });
    
    showLoading('Uploading files...');
    
    try {
        const uploadUrl = `${API_BASE}/api/store/upload`;
        console.log(`📤 Sending POST to: ${uploadUrl}`);
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        
        console.log(`📥 Response: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success) {
            console.log('✅ Upload successful!');
            showToast('success', `Uploaded ${data.count} file(s)!`);
            
            // Reset
            selectedFiles = [];
            fileInput.value = '';
            resetUploadArea();
            uploadBtn.disabled = true;
            
            // Reload files list
            await loadUploadedFiles();
        } else {
            console.error('❌ Upload failed:', data.error);
            showToast('error', `Upload failed: ${data.error}`);
        }
    } catch (error) {
        console.error('❌ Upload exception:', error);
        showToast('error', `Error: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Handle File Selection
function handleFileSelect(files) {
    console.log(`📁 handleFileSelect: ${files.length} file(s)`);
    selectedFiles = Array.from(files);
    
    if (selectedFiles.length === 0) {
        uploadBtn.disabled = true;
        return;
    }
    
    console.log('✅ Files ready:', selectedFiles.map(f => f.name).join(', '));
    updateUploadAreaDisplay();
    uploadBtn.disabled = false;
}

function updateUploadAreaDisplay() {
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    if (placeholder && selectedFiles.length > 0) {
        placeholder.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
            </svg>
            <p><strong>${selectedFiles.length}</strong> file(s) selected</p>
            <p class="upload-hint">${selectedFiles.map(f => f.name).join(', ')}</p>
        `;
    }
}

function resetUploadArea() {
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    if (placeholder) {
        placeholder.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p>Click to upload or drag & drop</p>
            <p class="upload-hint">PDF, DOC, DOCX, TXT (max 100MB per file)</p>
        `;
    }
}

// Load Uploaded Files
async function loadUploadedFiles() {
    try {
        console.log('🔄 Loading uploaded files...');
        const response = await fetch(`${API_BASE}/api/store/files`);
        const data = await response.json();

        if (data.success) {
            uploadedFiles = data.files;
            console.log(`✅ Loaded ${uploadedFiles.length} file(s)`);
            renderFilesList();
            updateStoreInfo();
            updateQueryUI();
        }
    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// Render Files List
function renderFilesList() {
    if (uploadedFiles.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <p>No documents uploaded yet</p>
            </div>
        `;
        clearBtn.style.display = 'none';
        return;
    }

    filesList.innerHTML = uploadedFiles.map(file => {
        const sizeKB = (parseInt(file.sizeBytes) / 1024).toFixed(1);
        return `
            <div class="file-item fade-in">
                <div class="file-info">
                    <div class="file-icon">📄</div>
                    <div class="file-details">
                        <div class="file-name">${file.displayName}</div>
                        <div class="file-meta">${sizeKB} KB</div>
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
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Health Check
async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE}/api/health`);
        const data = await response.json();
        console.log('✅ Server status:', data);
    } catch (error) {
        console.error('❌ Server connection error:', error);
        showToast('error', 'Cannot connect to server. Please make sure the server is running.');
    }
}

// Global debug functions
window.debugApp = function() {
    console.log('=== APP DEBUG INFO ===');
    console.log('Upload button:', uploadBtn);
    console.log('Button disabled:', uploadBtn?.disabled);
    console.log('Selected files:', selectedFiles);
    console.log('Uploaded files:', uploadedFiles);
    return { uploadBtn, selectedFiles, uploadedFiles };
};

window.testUpload = function() {
    if (selectedFiles.length > 0) {
        console.log('Testing upload with files:', selectedFiles);
        performUpload();
    } else {
        console.log('No files selected. Select files first.');
    }
};

console.log('🔧 Debug commands available:');
console.log('  debugApp() - Check app state');
console.log('  testUpload() - Test upload function');