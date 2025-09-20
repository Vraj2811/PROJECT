from flask import Flask, render_template, request, jsonify
import json
import sqlite3
import os
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Database and folder configuration
DATABASE_PATH = 'question_bank.db'
QUESTION_BANK_FOLDER = 'Question Bank'

def init_database():
    """Initialize the SQLite database with the required table"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            question_type TEXT NOT NULL,
            subject TEXT NOT NULL,
            topic TEXT NOT NULL,
            subtopic TEXT,
            difficulty_level TEXT NOT NULL,
            estimated_time INTEGER NOT NULL,
            bloom_level TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

def create_folder_structure(subject, topic, subtopic=None):
    """Create the folder structure for organizing questions"""
    # Create main Question Bank folder
    base_path = Path(QUESTION_BANK_FOLDER)
    base_path.mkdir(exist_ok=True)

    # Create subject folder
    subject_path = base_path / subject
    subject_path.mkdir(exist_ok=True)

    # Create topic folder
    topic_path = subject_path / topic
    topic_path.mkdir(exist_ok=True)

    # Create subtopic folder if provided
    if subtopic and subtopic.strip():
        subtopic_path = topic_path / subtopic
        subtopic_path.mkdir(exist_ok=True)
        return subtopic_path
    else:
        return topic_path

def save_markdown_file(folder_path, question_id, markdown_content):
    """Save the markdown content to a file"""
    file_path = folder_path / f"{question_id}.md"
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    return str(file_path)

# Question types options
QUESTION_TYPES = [
    'MCQ',
    'Coding',
    'Numerical',
    'Descriptive',
    'Fill-in-the-blank',
    'True/False',
    'Short Answer'
]

# Bloom's Taxonomy levels
BLOOM_LEVELS = [
    'Recall',
    'Understand',
    'Apply',
    'Analyze',
    'Evaluate',
    'Create'
]

# Difficulty levels
DIFFICULTY_LEVELS = [
    'Easy',
    'Medium',
    'Hard'
]

@app.route('/')
def index():
    return render_template('index.html', 
                         question_types=QUESTION_TYPES,
                         bloom_levels=BLOOM_LEVELS,
                         difficulty_levels=DIFFICULTY_LEVELS)

@app.route('/submit', methods=['POST'])
def submit_question():
    try:
        # Get form data
        title = request.form.get('title')
        full_question_text = request.form.get('full_question_text')
        question_type = request.form.get('question_type')
        subject = request.form.get('subject')
        topic = request.form.get('topic')
        subtopic = request.form.get('subtopic')
        difficulty_level = request.form.get('difficulty_level')
        estimated_time = request.form.get('estimated_time')
        bloom_level = request.form.get('bloom_level')

        # Validate required fields
        if not all([title, full_question_text, question_type, subject, topic,
                   difficulty_level, estimated_time, bloom_level]):
            return jsonify({
                'status': 'error',
                'message': 'All required fields must be filled'
            }), 400

        # Insert into database
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            INSERT INTO questions (title, question_type, subject, topic, subtopic,
                                 difficulty_level, estimated_time, bloom_level)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (title, question_type, subject, topic, subtopic,
              difficulty_level, int(estimated_time), bloom_level))

        question_id = cursor.lastrowid
        conn.commit()
        conn.close()

        # Create folder structure
        folder_path = create_folder_structure(subject, topic, subtopic)

        # Save markdown file
        file_path = save_markdown_file(folder_path, question_id, full_question_text)

        # Prepare response data
        question_data = {
            'id': question_id,
            'title': title,
            'question_type': question_type,
            'subject': subject,
            'topic': topic,
            'subtopic': subtopic,
            'difficulty_level': difficulty_level,
            'estimated_time': estimated_time,
            'bloom_level': bloom_level,
            'file_path': file_path,
            'created_at': datetime.now().isoformat()
        }

        return jsonify({
            'status': 'success',
            'message': f'Question submitted successfully! Saved as ID: {question_id}',
            'data': question_data
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Error submitting question: {str(e)}'
        }), 400

@app.route('/preview_markdown', methods=['POST'])
def preview_markdown():
    """API endpoint to preview markdown content"""
    try:
        markdown_text = request.json.get('markdown', '')
        # Here you could use a markdown library to convert to HTML
        # For now, we'll return the raw text (the frontend will handle conversion)
        return jsonify({
            'status': 'success',
            'markdown': markdown_text
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@app.route('/questions')
def view_questions():
    """View all questions in the database"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        cursor.execute('''
            SELECT id, title, question_type, subject, topic, subtopic,
                   difficulty_level, estimated_time, bloom_level, created_at
            FROM questions
            ORDER BY created_at DESC
        ''')

        questions = []
        for row in cursor.fetchall():
            questions.append({
                'id': row[0],
                'title': row[1],
                'question_type': row[2],
                'subject': row[3],
                'topic': row[4],
                'subtopic': row[5],
                'difficulty_level': row[6],
                'estimated_time': row[7],
                'bloom_level': row[8],
                'created_at': row[9]
            })

        conn.close()

        return jsonify({
            'status': 'success',
            'questions': questions,
            'total': len(questions)
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    # Initialize database on startup
    init_database()
    app.run(debug=True, host='0.0.0.0', port=5000)
