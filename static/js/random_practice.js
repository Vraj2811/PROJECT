// Random Practice JavaScript
let selectedTopics = [];
let currentQuestion = null;
let practiceStarted = false;
let loadingModal = null; // Store modal instance globally

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the loading modal once
    try {
        const modalElement = document.getElementById('loadingModal');
        if (modalElement) {
            loadingModal = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: false
            });
            console.log('Loading modal initialized successfully');
        } else {
            console.error('Loading modal element not found');
        }
    } catch (error) {
        console.error('Error initializing modal:', error);
    }

    loadTopics();
    setupEventListeners();
});

// Helper function to safely hide the loading modal
function hideLoadingModal() {
    if (loadingModal) {
        try {
            loadingModal.hide();
            console.log('Modal hidden successfully');
        } catch (error) {
            console.error('Error hiding modal:', error);
            // Force hide by manipulating DOM directly
            try {
                const modalElement = document.getElementById('loadingModal');
                if (modalElement) {
                    modalElement.style.display = 'none';
                    modalElement.classList.remove('show');
                    document.body.classList.remove('modal-open');
                    // Remove backdrop if it exists
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) {
                        backdrop.remove();
                    }
                    console.log('Modal force hidden');
                }
            } catch (forceError) {
                console.error('Error force hiding modal:', forceError);
            }
        }
    }
}

function setupEventListeners() {
    // Select all topics checkbox
    document.getElementById('select-all-topics').addEventListener('change', function() {
        const isChecked = this.checked;
        const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
        
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
        
        updateSelectedTopics();
    });
    
    // Start practice button
    document.getElementById('start-practice-btn').addEventListener('click', startPracticeSession);
    
    // Next question button
    document.getElementById('next-question-btn').addEventListener('click', loadNextQuestion);
    
    // End session button
    document.getElementById('end-session-btn').addEventListener('click', endPracticeSession);
    
    // Submit answer button
    document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
    
    // Clear answer button
    document.getElementById('clear-answer-btn').addEventListener('click', function() {
        document.getElementById('student-answer').value = '';
    });
}

function loadTopics() {
    fetch('/api/practice/topics')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayTopics(data.topics);
            } else {
                showError('Failed to load topics: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading topics:', error);
            showError('Error loading topics. Please try again.');
        });
}

function displayTopics(topics) {
    const container = document.getElementById('topics-container');
    
    // Group topics by subject
    const topicsBySubject = {};
    topics.forEach(topic => {
        if (!topicsBySubject[topic.subject]) {
            topicsBySubject[topic.subject] = [];
        }
        topicsBySubject[topic.subject].push(topic);
    });
    
    let html = '';
    Object.keys(topicsBySubject).forEach(subject => {
        html += `
            <div class="mb-4">
                <h6 class="text-primary fw-bold">${subject}</h6>
                <div class="row">
        `;
        
        topicsBySubject[subject].forEach(topic => {
            const topicId = `${topic.subject}:${topic.topic}`;
            html += `
                <div class="col-md-6 mb-2">
                    <div class="form-check">
                        <input class="form-check-input topic-checkbox" type="checkbox" 
                               id="topic-${topicId.replace(/[^a-zA-Z0-9]/g, '_')}" 
                               value="${topicId}">
                        <label class="form-check-label" for="topic-${topicId.replace(/[^a-zA-Z0-9]/g, '_')}">
                            ${topic.topic} 
                            <span class="badge bg-secondary">${topic.question_count}</span>
                        </label>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners to topic checkboxes
    document.querySelectorAll('.topic-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedTopics);
    });
}

function updateSelectedTopics() {
    const selectAllCheckbox = document.getElementById('select-all-topics');
    const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
    const startButton = document.getElementById('start-practice-btn');
    
    selectedTopics = [];
    
    if (selectAllCheckbox.checked) {
        selectedTopics = ['all'];
    } else {
        topicCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTopics.push(checkbox.value);
            }
        });
    }
    
    // Enable/disable start button
    startButton.disabled = selectedTopics.length === 0;
}

function startPracticeSession() {
    practiceStarted = true;
    
    // Hide topic selection and show practice session
    document.getElementById('topic-selection').style.display = 'none';
    document.getElementById('practice-session').style.display = 'block';
    
    // Load first question
    loadNextQuestion();
}

function loadNextQuestion() {
    console.log('Loading next question...'); // Debug log

    // Ensure modal is available and properly initialized
    if (!loadingModal) {
        console.log('Reinitializing modal...');
        try {
            const modalElement = document.getElementById('loadingModal');
            if (modalElement) {
                loadingModal = new bootstrap.Modal(modalElement, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
        } catch (error) {
            console.error('Error reinitializing modal:', error);
        }
    }

    // Show loading modal
    if (loadingModal) {
        try {
            loadingModal.show();
            console.log('Modal shown successfully');
        } catch (error) {
            console.error('Error showing modal:', error);
            // Try to reinitialize and show again
            try {
                const modalElement = document.getElementById('loadingModal');
                loadingModal = new bootstrap.Modal(modalElement);
                loadingModal.show();
                console.log('Modal reinitialized and shown');
            } catch (retryError) {
                console.error('Error on modal retry:', retryError);
            }
        }
    } else {
        console.error('Loading modal not available');
    }

    // Set a timeout to hide modal if request takes too long (10 seconds)
    const modalTimeout = setTimeout(() => {
        console.warn('Request timeout - hiding modal');
        hideLoadingModal();
        showError('Request timed out. Please try again.');
    }, 10000);

    // Build query parameters
    const params = new URLSearchParams();
    selectedTopics.forEach(topic => {
        params.append('topics', topic);
    });

    console.log('Fetching question with params:', params.toString());

    fetch(`/api/practice/random-question?${params.toString()}`)
        .then(response => {
            clearTimeout(modalTimeout); // Clear timeout on response
            console.log('Response received:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);

            // Hide loading modal
            hideLoadingModal();

            if (data.status === 'success') {
                currentQuestion = data.question;
                displayQuestion(currentQuestion);
                clearAnswer();
            } else {
                showError('Failed to load question: ' + data.message);
            }
        })
        .catch(error => {
            clearTimeout(modalTimeout); // Clear timeout on error
            console.error('Error loading question:', error);

            // Hide loading modal on error
            hideLoadingModal();
            showError('Error loading question. Please try again.');
        });
}

function displayQuestion(question) {
    try {
        console.log('Displaying question:', question); // Debug log

        // Update question metadata
        document.getElementById('current-question-title').textContent = question.title || 'Untitled Question';
        document.getElementById('question-type-badge').textContent = question.question_type || 'Unknown';
        document.getElementById('difficulty-badge').textContent = question.difficulty_level || 'Unknown';
        document.getElementById('question-subject').textContent = question.subject || 'Unknown';
        document.getElementById('question-topic').textContent = question.topic || 'Unknown';
        document.getElementById('question-time').textContent = question.estimated_time || '0';
        document.getElementById('question-bloom').textContent = question.bloom_level || 'Unknown';

        // Render question content
        const contentDiv = document.getElementById('question-content');
        if (question.content && question.content.trim()) {
            try {
                contentDiv.innerHTML = marked.parse(question.content);
            } catch (markdownError) {
                console.error('Markdown parsing error:', markdownError);
                contentDiv.innerHTML = `<pre>${question.content}</pre>`;
            }
        } else {
            contentDiv.innerHTML = '<p class="text-muted">No content available for this question.</p>';
        }

        console.log('Question displayed successfully'); // Debug log
    } catch (error) {
        console.error('Error displaying question:', error);
        showError('Error displaying question content.');
    }
}

function submitAnswer() {
    const answer = document.getElementById('student-answer').value.trim();
    
    if (!answer) {
        alert('Please enter an answer before submitting.');
        return;
    }
    
    // For now, just show a success message
    // In a real application, you might want to save the answer or provide feedback
    alert('Answer submitted successfully! Click "Next Question" to continue.');
    
    // Optionally disable the submit button until next question
    document.getElementById('submit-answer-btn').disabled = true;
    document.getElementById('next-question-btn').focus();
}

function clearAnswer() {
    document.getElementById('student-answer').value = '';
    document.getElementById('submit-answer-btn').disabled = false;
}

function endPracticeSession() {
    if (confirm('Are you sure you want to end this practice session?')) {
        practiceStarted = false;
        
        // Show topic selection and hide practice session
        document.getElementById('practice-session').style.display = 'none';
        document.getElementById('topic-selection').style.display = 'block';
        
        // Reset selections
        document.getElementById('select-all-topics').checked = false;
        document.querySelectorAll('.topic-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        selectedTopics = [];
        currentQuestion = null;
        updateSelectedTopics();
    }
}

function showError(message) {
    // Ensure modal is hidden when showing error
    hideLoadingModal();

    // Create and show an alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        <i class="bi bi-exclamation-triangle"></i> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Insert at the top of the container
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 8000);
}
