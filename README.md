# Question Bank Management System

A comprehensive Flask-based web application for managing educational questions with advanced features including AI-powered question generation, student practice modes, automated paper generation, and role-based access control.

## 🚀 Key Features

### 👨‍🏫 Teacher Features
- **Question Management**: Create, edit, view, and delete questions with markdown support
- **Live Markdown Preview**: Real-time preview of markdown-formatted questions
- **AI-Powered Question Generation**: Generate similar questions using OpenAI GPT models with variable parameters
- **Automated Paper Generation**: Create custom question papers based on multiple criteria:
  - Subject, Topic, and Subtopic selection
  - Difficulty level distribution (Easy, Medium, Hard)
  - Question type filtering (MCQ, Coding, Numerical, etc.)
  - Bloom's taxonomy level selection
  - Total marks and time allocation
  - Export papers in multiple formats (JSON, Text, Markdown)
- **Question Analytics**: View statistics and insights about question bank

### 👨‍🎓 Student Features
- **Browse Questions**: Navigate through organized question hierarchy (Subject → Topic → Subtopic)
- **Practice Mode**: Select specific topics and practice questions with:
  - Answer submission capability
  - Question metadata display
  - Markdown rendering
  - Clear and submit functionality
- **Random Practice**: Generate random practice sessions by:
  - Selecting multiple topics
  - Getting random questions from selected categories
  - Interactive answer submission
  - Progress tracking

### 🔐 Security Features
- **Role-Based Access Control**: Separate interfaces for teachers and students
- **Session Management**: Secure login/logout functionality
- **Protected Routes**: Decorator-based route protection

### 📊 Data Organization
- **SQLite Database**: Efficient storage of question metadata
- **Organized File Structure**: Hierarchical folder organization (Subject → Topic → Subtopic)
- **Markdown File Storage**: Each question stored as individual `.md` file

## 📁 Project Structure

```
PROJECT/
├── app.py                          # Main Flask application with all routes
├── ai.py                           # AI-powered question generation module
├── teacher_backend.py              # Teacher operations backend logic
├── enhanced_paper_generation.py    # Advanced paper generation engine
├── requirements.txt                # Python dependencies
├── question_bank.db               # SQLite database (auto-created)
├── Question Bank/                 # Organized question storage
│   └── {Subject}/
│       └── {Topic}/
│           └── {Subtopic}/
│               └── {id}.md
├── Generated Papers/              # Generated question papers (auto-created)
├── templates/                     # HTML templates
│   ├── index.html                # Landing page
│   ├── teacher_login.html        # Teacher login
│   ├── student_login.html        # Student login
│   ├── teacher_dashboard.html    # Teacher dashboard
│   ├── student_dashboard.html    # Student dashboard
│   ├── teacher.html              # Add question form
│   ├── teacher_management.html   # Question management interface
│   ├── create_paper.html         # Paper generation interface
│   ├── practice.html             # Student practice mode
│   └── random_practice.html      # Random practice mode
└── static/                        # Static assets
    ├── css/
    │   └── style.css             # Custom styling
    └── js/
        ├── script.js             # Main form JavaScript
        ├── teacher.js            # Teacher interface logic
        ├── teacher_management.js # Question management logic
        ├── create_paper.js       # Paper generation logic
        ├── practice.js           # Practice mode logic
        └── random_practice.js    # Random practice logic
```

## 🗄️ Database Schema

### Questions Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Auto-incrementing unique identifier |
| `title` | TEXT NOT NULL | Short descriptive label for the question |
| `question_type` | TEXT NOT NULL | Type (MCQ, Coding, Numerical, Descriptive, etc.) |
| `subject` | TEXT NOT NULL | Broad subject category (e.g., Data Structures) |
| `topic` | TEXT NOT NULL | Specific topic within subject (e.g., Trees) |
| `subtopic` | TEXT | Finer breakdown (e.g., Binary Search Trees) |
| `difficulty_level` | TEXT NOT NULL | Easy, Medium, or Hard |
| `estimated_time` | INTEGER NOT NULL | Time in minutes |
| `bloom_level` | TEXT NOT NULL | Bloom's Taxonomy level |
| `is_ai_generated` | BOOLEAN | Flag for AI-generated questions |
| `ai_generation_notes` | TEXT | Notes about AI generation parameters |
| `parent_question_id` | INTEGER | Reference to parent question (for AI variants) |
| `created_at` | TIMESTAMP | Auto-generated timestamp |

## 🛠️ Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- OpenAI API key (for AI features)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   cd /Users/pranjalgaur/Desktop/Project_Course/PROJECT
   ```

2. **Create Virtual Environment** (Recommended):
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # or
   venv\Scripts\activate  # On Windows
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set OpenAI API Key** (Optional - for AI features):
   ```bash
   export OPENAI_API_KEY='your-api-key-here'  # On macOS/Linux
   # or
   set OPENAI_API_KEY=your-api-key-here  # On Windows
   ```

5. **Run the Application**:
   ```bash
   python app.py
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:5001`

## 🔑 Default Login Credentials

### Teacher Account
- **Username**: `teacher`
- **Password**: `teacher123`

### Student Account
- **Username**: `student`
- **Password**: `student123`

> ⚠️ **Security Note**: Change these credentials in production by modifying the `USERS` dictionary in `app.py`

## 📡 API Endpoints

### Authentication Routes
- `GET /` - Landing page with login options
- `GET /teacher-login` - Teacher login page
- `GET /student-login` - Student login page
- `POST /login` - Handle login authentication
- `GET /logout` - Logout and clear session

### Teacher Routes
- `GET /teacher-dashboard` - Teacher dashboard
- `GET /teacher` - Add new question form
- `GET /teacher/manage` - Question management interface
- `POST /submit` - Submit new question
- `POST /preview_markdown` - Preview markdown content
- `GET /questions` - View all questions (JSON)
- `GET /create_paper` - Paper generation interface

### Student Routes
- `GET /student-dashboard` - Student dashboard
- `GET /practice` - Browse questions practice mode
- `GET /random_practice` - Random practice mode

### API Endpoints (JSON)

#### Practice Mode APIs
- `GET /api/practice/tree` - Get question tree structure
- `GET /api/practice/questions?subject=X&topic=Y&subtopic=Z` - Get questions by category
- `GET /api/practice/question/<id>` - Get specific question with content

#### Random Practice APIs
- `GET /api/random-practice/topics` - Get all available topics
- `POST /api/random-practice/generate` - Generate random question set

#### Paper Generation APIs
- `GET /api/paper/subjects` - Get all subjects
- `GET /api/paper/topics?subject=X` - Get topics for subject
- `GET /api/paper/subtopics?subject=X&topic=Y` - Get subtopics
- `POST /api/paper/generate` - Generate question paper

#### Teacher Management APIs
- `GET /api/teacher/questions` - Get all questions with filters
- `GET /api/teacher/question/<id>` - Get question details
- `PUT /api/teacher/question/<id>` - Update question
- `DELETE /api/teacher/question/<id>` - Delete question
- `GET /api/teacher/stats` - Get question bank statistics
- `POST /api/teacher/generate-question` - AI generate similar question

## 💡 Usage Guide

### For Teachers

#### Adding a Question
1. Login as teacher
2. Navigate to "Add Question" from dashboard
3. Fill in all required fields:
   - Title (short label)
   - Question content (markdown supported)
   - Question type (MCQ, Coding, etc.)
   - Subject, Topic, Subtopic
   - Difficulty level
   - Estimated time
   - Bloom's taxonomy level
4. Use live preview to verify formatting
5. Click "Submit Question"

#### Managing Questions
1. Go to "Manage Questions" from dashboard
2. Use filters to find questions:
   - Search by title
   - Filter by subject, topic, subtopic
   - Filter by difficulty, type, or Bloom level
3. View, edit, or delete questions
4. Generate AI variations of existing questions

#### Generating Papers
1. Navigate to "Create Paper"
2. Configure paper criteria:
   - Select subject(s), topic(s), subtopic(s)
   - Set difficulty distribution
   - Choose question types
   - Set Bloom's taxonomy levels
   - Define total questions and marks
3. Click "Generate Paper"
4. Export in desired format (JSON, Text, Markdown)

### For Students

#### Browse Practice
1. Login as student
2. Click "Browse Questions" from dashboard
3. Navigate the tree structure on the left
4. Click on a subtopic to view questions
5. Click on a question to view full details
6. Write and submit your answer
7. Use "Clear" to reset your answer

#### Random Practice
1. Click "Random Practice" from dashboard
2. Select topics you want to practice
3. Click "Start Practice Session"
4. Answer questions one by one
5. Use "Next Question" to move forward
6. Submit answers for each question
7. End session when done

## 🤖 AI Question Generation

The system uses OpenAI's GPT models to generate similar questions with variable parameters:

### Features
- Maintains same difficulty level and Bloom's taxonomy
- Supports variable parameters with ranges
- Preserves question structure and format
- Generates unique variations automatically

### Usage
1. Select an existing question in "Manage Questions"
2. Click "Generate AI Question"
3. Configure parameters (if applicable)
4. Specify additional notes
5. Generate and review the new question

## 📄 Paper Generation Criteria

Papers can be generated with sophisticated criteria:

- **Content Selection**: Multiple subjects, topics, and subtopics
- **Distribution Control**: Percentage-based difficulty distribution
- **Type Filtering**: Include/exclude specific question types
- **Bloom Levels**: Target specific cognitive levels
- **Marks & Time**: Set total marks and time limits
- **Smart Selection**: Ensures balanced coverage

## 🎨 Technologies Used

### Backend
- **Flask** 2.3.3 - Web framework
- **SQLite3** - Database
- **OpenAI API** - AI question generation

### Frontend
- **Bootstrap 5** - UI framework
- **Bootstrap Icons** - Icon library
- **Marked.js** - Markdown parser
- **Vanilla JavaScript** - Interactive functionality

### Additional Libraries
- **Werkzeug** 2.3.7 - WSGI utilities
- **Jinja2** 3.1.2 - Template engine

## 🔧 Configuration

### Changing Port
Edit `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Change port here
```

### Updating User Credentials
Edit the `USERS` dictionary in `app.py`:
```python
USERS = {
    'teacher': {'password': 'your_password', 'role': 'teacher'},
    'student': {'password': 'your_password', 'role': 'student'},
}
```

### OpenAI Configuration
Set your API key as environment variable or modify in code where needed.

## 🐛 Troubleshooting

### Database Issues
If database errors occur:
```bash
# Delete the database and restart
rm question_bank.db
python app.py
```

### Port Already in Use
Change the port number in `app.py` or kill the process:
```bash
# Find process on port 5001
lsof -i :5001
# Kill the process
kill -9 <PID>
```

### Missing Dependencies
Reinstall requirements:
```bash
pip install -r requirements.txt --upgrade
```

## 📝 Future Enhancements

- [ ] Add user registration and profile management
- [ ] Implement question bank import/export
- [ ] Add plagiarism detection for answers
- [ ] Include image upload support for questions
- [ ] Add real-time collaboration features
- [ ] Implement advanced analytics dashboard
- [ ] Support for multiple languages
- [ ] Mobile application development

## 📄 License

This project is for educational purposes.

## 👥 Contributors

- Project developed as part of educational coursework
- Repository: Vraj2811/PROJECT

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.
