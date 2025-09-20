# Question Bank Management System

A Flask-based web application for managing educational questions with markdown support and organized file storage.

## Features

- **Comprehensive Question Form**: Captures all essential question metadata including:
  - Title/Short Label
  - Full Question Text (with Markdown support)
  - Question Type (MCQ, Coding, Numerical, etc.)
  - Subject, Topic, and Subtopic
  - Difficulty Level
  - Estimated Time to Solve
  - Bloom's Taxonomy Level

- **Live Markdown Preview**: Real-time preview of markdown-formatted questions
- **SQLite Database**: Stores question metadata for easy querying
- **Organized File Structure**: Automatically creates folder hierarchy based on Subject → Topic → Subtopic
- **Markdown File Storage**: Each question's content is saved as `{id}.md` in the appropriate folder

## Database Schema

The SQLite database (`question_bank.db`) contains a `questions` table with the following columns:

- `id` (INTEGER PRIMARY KEY): Auto-incrementing unique identifier
- `title` (TEXT): Short descriptive label
- `question_type` (TEXT): Type of question (MCQ, Coding, etc.)
- `subject` (TEXT): Broad subject category
- `topic` (TEXT): Specific area within the subject
- `subtopic` (TEXT): Finer breakdown under topic (optional)
- `difficulty_level` (TEXT): Easy, Medium, or Hard
- `estimated_time` (INTEGER): Time in minutes
- `bloom_level` (TEXT): Bloom's Taxonomy level
- `created_at` (TIMESTAMP): Auto-generated timestamp

## Folder Structure

Questions are organized in the following hierarchy:

```
Question Bank/
├── {Subject}/
│   ├── {Topic}/
│   │   ├── {Subtopic}/
│   │   │   ├── {id}.md
│   │   │   └── ...
│   │   └── {id}.md (if no subtopic)
│   └── ...
└── ...
```

## Installation and Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**:
   ```bash
   python app.py
   ```

3. **Access the Application**:
   Open your browser and navigate to `http://localhost:5001`

## API Endpoints

- `GET /` - Main form interface
- `POST /submit` - Submit a new question
- `GET /questions` - View all questions in JSON format
- `POST /preview_markdown` - Preview markdown content

## Usage

1. **Fill out the form** with all required question details
2. **Write your question** in the markdown editor (left side)
3. **Preview the formatted output** in real-time (right side)
4. **Submit the question** - it will be:
   - Saved to the SQLite database
   - Stored as a markdown file in the organized folder structure
   - Assigned a unique ID for reference

## Example

When you submit a question with:
- Subject: "Data Structures"
- Topic: "Trees"
- Subtopic: "Binary Search Trees"

The system will:
1. Create the folder structure: `Question Bank/Data Structures/Trees/Binary Search Trees/`
2. Save the question content as `{id}.md` in that folder
3. Store metadata in the database with the assigned ID

## File Structure

```
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── question_bank.db      # SQLite database (created automatically)
├── Question Bank/        # Organized question storage (created automatically)
├── templates/
│   └── index.html        # Main form template
└── static/
    ├── css/
    │   └── style.css     # Custom styling
    └── js/
        └── script.js     # Frontend JavaScript
```

## Technologies Used

- **Backend**: Flask (Python)
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Bootstrap 5
- **Markdown**: Marked.js for live preview
- **Icons**: Bootstrap Icons
