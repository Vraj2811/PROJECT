// Question Bank Form JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('questionForm');
    const markdownInput = document.getElementById('full_question_text');
    const markdownPreview = document.getElementById('markdown-preview');
    const resultModal = new bootstrap.Modal(document.getElementById('resultModal'));

    // Initialize markdown preview
    updateMarkdownPreview();

    // Real-time markdown preview
    markdownInput.addEventListener('input', updateMarkdownPreview);

    // Form submission
    form.addEventListener('submit', handleFormSubmit);

    // Form reset
    form.addEventListener('reset', function() {
        setTimeout(() => {
            updateMarkdownPreview();
            form.classList.remove('was-validated');
        }, 10);
    });

    /**
     * Update the markdown preview in real-time
     */
    function updateMarkdownPreview() {
        const markdownText = markdownInput.value.trim();
        
        if (markdownText === '') {
            markdownPreview.innerHTML = '<em class="text-muted">Preview will appear here as you type...</em>';
            return;
        }

        try {
            // Convert markdown to HTML using marked.js
            const htmlContent = marked.parse(markdownText);
            markdownPreview.innerHTML = htmlContent;
        } catch (error) {
            markdownPreview.innerHTML = '<div class="alert alert-danger">Error rendering markdown: ' + error.message + '</div>';
        }
    }

    /**
     * Handle form submission
     */
    async function handleFormSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        // Add validation classes
        form.classList.add('was-validated');

        // Check if form is valid
        if (!form.checkValidity()) {
            return;
        }

        // Disable submit button and show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Submitting...';

        try {
            // Prepare form data
            const formData = new FormData(form);
            
            // Submit the form
            const response = await fetch('/submit', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                showModal('Success!', 
                    `<div class="alert alert-success">
                        <i class="bi bi-check-circle"></i> ${result.message}
                    </div>
                    <h6>Submitted Data:</h6>
                    <pre class="bg-light p-2 rounded">${JSON.stringify(result.data, null, 2)}</pre>`, 
                    'success');
                
                // Reset form on success
                form.reset();
                form.classList.remove('was-validated');
                updateMarkdownPreview();
            } else {
                showModal('Error!', 
                    `<div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> ${result.message}
                    </div>`, 
                    'error');
            }

        } catch (error) {
            showModal('Error!', 
                `<div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> Network error: ${error.message}
                </div>`, 
                'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    /**
     * Show modal with result
     */
    function showModal(title, body, type) {
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = body;
        
        // Add appropriate classes based on type
        const modalContent = document.querySelector('#resultModal .modal-content');
        modalContent.classList.remove('border-success', 'border-danger');
        
        if (type === 'success') {
            modalContent.classList.add('border-success');
        } else if (type === 'error') {
            modalContent.classList.add('border-danger');
        }
        
        resultModal.show();
    }

    /**
     * Add tooltips to form labels (optional enhancement)
     */
    function initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Initialize tooltips if any exist
    initializeTooltips();

    /**
     * Auto-resize textarea based on content (optional enhancement)
     */
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Optional: Auto-resize the markdown textarea
    markdownInput.addEventListener('input', function() {
        // Uncomment the line below if you want auto-resize functionality
        // autoResizeTextarea(this);
    });

    /**
     * Add keyboard shortcuts for markdown formatting
     */
    markdownInput.addEventListener('keydown', function(event) {
        // Ctrl+B for bold
        if (event.ctrlKey && event.key === 'b') {
            event.preventDefault();
            insertMarkdownFormat('**', '**');
        }
        
        // Ctrl+I for italic
        if (event.ctrlKey && event.key === 'i') {
            event.preventDefault();
            insertMarkdownFormat('*', '*');
        }
        
        // Ctrl+K for code
        if (event.ctrlKey && event.key === 'k') {
            event.preventDefault();
            insertMarkdownFormat('`', '`');
        }
    });

    /**
     * Insert markdown formatting around selected text
     */
    function insertMarkdownFormat(before, after) {
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        const selectedText = markdownInput.value.substring(start, end);
        const replacement = before + selectedText + after;
        
        markdownInput.value = markdownInput.value.substring(0, start) + replacement + markdownInput.value.substring(end);
        
        // Set cursor position
        const newCursorPos = start + before.length + selectedText.length + after.length;
        markdownInput.setSelectionRange(newCursorPos, newCursorPos);
        
        // Update preview
        updateMarkdownPreview();
        
        // Focus back to textarea
        markdownInput.focus();
    }

    /**
     * Add sample data for testing (optional)
     */
    function loadSampleData() {
        document.getElementById('title').value = 'Binary Search Tree Insertion';
        document.getElementById('question_type').value = 'Coding';
        document.getElementById('subject').value = 'Data Structures';
        document.getElementById('topic').value = 'Trees';
        document.getElementById('subtopic').value = 'Binary Search Trees';
        document.getElementById('difficulty_level').value = 'Medium';
        document.getElementById('estimated_time').value = '15';
        document.getElementById('bloom_level').value = 'Apply';
        
        const sampleQuestion = `# Binary Search Tree Insertion

Given a **Binary Search Tree**, write a function to insert a new value while maintaining the BST property.

## Function Signature
\`\`\`python
def insert_bst(root, value):
    """
    Insert a value into the BST
    Args:
        root: TreeNode - root of the BST
        value: int - value to insert
    Returns:
        TreeNode - root of the modified BST
    """
    pass
\`\`\`

## Example
- Input: BST with values [5, 3, 7, 2, 4, 6, 8], insert 1
- Output: BST with values [5, 3, 7, 2, 4, 6, 8, 1]

## Constraints
- All values are unique integers
- Tree can be empty (root = None)`;
        
        markdownInput.value = sampleQuestion;
        updateMarkdownPreview();
    }

    // Add sample data button (for testing purposes)
    // Uncomment the lines below to add a "Load Sample" button
    /*
    const loadSampleBtn = document.createElement('button');
    loadSampleBtn.type = 'button';
    loadSampleBtn.className = 'btn btn-outline-secondary btn-sm';
    loadSampleBtn.innerHTML = '<i class="bi bi-file-text"></i> Load Sample Data';
    loadSampleBtn.onclick = loadSampleData;
    
    const cardHeader = document.querySelector('.card-header');
    cardHeader.appendChild(loadSampleBtn);
    */
});
