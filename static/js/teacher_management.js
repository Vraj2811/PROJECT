/**
 * Teacher Management Dashboard
 * Handles question management and statistics
 */

let questionsData = [];
let currentFilters = {};

document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
    loadStatistics();
    setupEventListeners();
});

function setupEventListeners() {
    // Filter buttons
    const filterBtn = document.getElementById('filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', applyFilters);
    }
    
    // Reset filters
    const resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Search
    const searchInput = document.getElementById('search-questions');
    if (searchInput) {
        searchInput.addEventListener('input', searchQuestions);
    }
}

/**
 * Load all questions
 */
async function loadQuestions() {
    try {
        const response = await fetch('/api/teacher/questions');
        const result = await response.json();
        
        if (result.status === 'success') {
            questionsData = result.questions;
            displayQuestions(questionsData);
        } else {
            showError('Failed to load questions: ' + result.message);
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    }
}

/**
 * Display questions in table
 */
function displayQuestions(questions) {
    const container = document.getElementById('questions-table-body');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (questions.length === 0) {
        container.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No questions found</td></tr>';
        return;
    }
    
    questions.forEach((q, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${q.title}</td>
            <td>${q.subject}</td>
            <td>${q.topic}</td>
            <td><span class="badge bg-info">${q.question_type}</span></td>
            <td><span class="badge bg-warning">${q.difficulty_level}</span></td>
            <td>${q.estimated_time}m</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editQuestion(${q.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteQuestion(${q.id})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            </td>
        `;
        container.appendChild(row);
    });
}

/**
 * Search questions
 */
function searchQuestions(event) {
    const searchTerm = event.target.value.toLowerCase();
    
    const filtered = questionsData.filter(q => 
        q.title.toLowerCase().includes(searchTerm) ||
        q.subject.toLowerCase().includes(searchTerm) ||
        q.topic.toLowerCase().includes(searchTerm)
    );
    
    displayQuestions(filtered);
}

/**
 * Apply filters
 */
function applyFilters() {
    const subject = document.getElementById('filter-subject')?.value;
    const difficulty = document.getElementById('filter-difficulty')?.value;
    const type = document.getElementById('filter-type')?.value;
    
    let filtered = questionsData;
    
    if (subject) {
        filtered = filtered.filter(q => q.subject === subject);
    }
    if (difficulty) {
        filtered = filtered.filter(q => q.difficulty_level === difficulty);
    }
    if (type) {
        filtered = filtered.filter(q => q.question_type === type);
    }
    
    displayQuestions(filtered);
}

/**
 * Reset filters
 */
function resetFilters() {
    document.getElementById('filter-subject').value = '';
    document.getElementById('filter-difficulty').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('search-questions').value = '';
    displayQuestions(questionsData);
}

/**
 * Edit question
 */
async function editQuestion(questionId) {
    try {
        const response = await fetch(`/api/teacher/question/${questionId}`);
        const result = await response.json();
        
        if (result.status === 'success') {
            // Populate edit form with question data
            const question = result.question;
            document.getElementById('edit-question-id').value = question.id;
            document.getElementById('edit-title').value = question.title;
            document.getElementById('edit-subject').value = question.subject;
            document.getElementById('edit-topic').value = question.topic;
            document.getElementById('edit-subtopic').value = question.subtopic || '';
            document.getElementById('edit-question-type').value = question.question_type;
            document.getElementById('edit-difficulty').value = question.difficulty_level;
            document.getElementById('edit-time').value = question.estimated_time;
            document.getElementById('edit-bloom').value = question.bloom_level;
            document.getElementById('edit-content').value = question.content;
            
            // Show edit modal
            const editModal = new bootstrap.Modal(document.getElementById('editQuestionModal'));
            editModal.show();
        } else {
            showError('Failed to load question: ' + result.message);
        }
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

/**
 * Save edited question
 */
async function saveEditedQuestion() {
    const questionId = document.getElementById('edit-question-id').value;
    
    const data = {
        title: document.getElementById('edit-title').value,
        subject: document.getElementById('edit-subject').value,
        topic: document.getElementById('edit-topic').value,
        subtopic: document.getElementById('edit-subtopic').value,
        question_type: document.getElementById('edit-question-type').value,
        difficulty_level: document.getElementById('edit-difficulty').value,
        estimated_time: document.getElementById('edit-time').value,
        bloom_level: document.getElementById('edit-bloom').value,
        content: document.getElementById('edit-content').value
    };
    
    try {
        const response = await fetch(`/api/teacher/question/${questionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Question updated successfully');
            bootstrap.Modal.getInstance(document.getElementById('editQuestionModal')).hide();
            loadQuestions();
        } else {
            showError('Failed to update question: ' + result.message);
        }
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

/**
 * Delete question
 */
async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/teacher/question/${questionId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            alert('Question deleted successfully');
            loadQuestions();
        } else {
            showError('Failed to delete question: ' + result.message);
        }
    } catch (error) {
        showError('Error: ' + error.message);
    }
}

/**
 * Load statistics
 */
async function loadStatistics() {
    try {
        const response = await fetch('/api/teacher/statistics');
        const result = await response.json();
        
        if (result.status === 'success') {
            displayStatistics(result.statistics);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

/**
 * Display statistics
 */
function displayStatistics(stats) {
    // Update total questions
    const totalEl = document.getElementById('stat-total-questions');
    if (totalEl) {
        totalEl.textContent = stats.total_questions;
    }
    
    // Update AI generated count
    const aiEl = document.getElementById('stat-ai-generated');
    if (aiEl) {
        aiEl.textContent = stats.ai_generated;
    }
    
    // Display by subject
    const subjectContainer = document.getElementById('stat-by-subject');
    if (subjectContainer) {
        let html = '';
        for (const [subject, count] of Object.entries(stats.by_subject)) {
            html += `<div class="badge bg-primary me-2 mb-2">${subject}: ${count}</div>`;
        }
        subjectContainer.innerHTML = html;
    }
    
    // Display by difficulty
    const diffContainer = document.getElementById('stat-by-difficulty');
    if (diffContainer) {
        let html = '';
        for (const [difficulty, count] of Object.entries(stats.by_difficulty)) {
            html += `<div class="badge bg-warning me-2 mb-2">${difficulty}: ${count}</div>`;
        }
        diffContainer.innerHTML = html;
    }
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
}

/**
 * Export questions to CSV
 */
function exportToCSV() {
    if (questionsData.length === 0) {
        alert('No questions to export');
        return;
    }
    
    let csv = 'ID,Title,Subject,Topic,Type,Difficulty,Time,Bloom Level\n';
    
    questionsData.forEach(q => {
        csv += `${q.id},"${q.title}","${q.subject}","${q.topic}","${q.question_type}","${q.difficulty_level}",${q.estimated_time},"${q.bloom_level}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

