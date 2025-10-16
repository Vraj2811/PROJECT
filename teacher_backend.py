"""
Teacher Backend Module
Handles all teacher-related operations including question management and paper generation
"""

import sqlite3
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TeacherBackend:
    """Main backend class for teacher operations"""
    
    def __init__(self, database_path: str, question_bank_folder: str = 'Question Bank'):
        """
        Initialize the teacher backend
        
        Args:
            database_path: Path to SQLite database
            question_bank_folder: Path to question bank folder
        """
        self.database_path = database_path
        self.question_bank_folder = Path(question_bank_folder)
        self.question_bank_folder.mkdir(exist_ok=True)
        
    def add_question(self, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add a new question to the database
        
        Args:
            question_data: Dictionary containing question details
            
        Returns:
            Response dictionary with status and data
        """
        try:
            # Validate required fields
            required_fields = ['title', 'content', 'question_type', 'subject', 'topic', 
                             'difficulty_level', 'estimated_time', 'bloom_level']
            
            for field in required_fields:
                if field not in question_data or not question_data[field]:
                    return {
                        'status': 'error',
                        'message': f'Missing required field: {field}'
                    }
            
            # Validate data types
            try:
                estimated_time = int(question_data['estimated_time'])
                if estimated_time <= 0:
                    return {
                        'status': 'error',
                        'message': 'Estimated time must be greater than 0'
                    }
            except (ValueError, TypeError):
                return {
                    'status': 'error',
                    'message': 'Estimated time must be a valid number'
                }
            
            # Create folder structure
            folder_path = self._create_folder_structure(
                question_data['subject'],
                question_data['topic'],
                question_data.get('subtopic')
            )
            
            # Insert into database
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO questions 
                (title, question_type, subject, topic, subtopic, difficulty_level, 
                 estimated_time, bloom_level, is_ai_generated, ai_generation_notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                question_data['title'],
                question_data['question_type'],
                question_data['subject'],
                question_data['topic'],
                question_data.get('subtopic'),
                question_data['difficulty_level'],
                estimated_time,
                question_data['bloom_level'],
                False,
                None
            ))
            
            question_id = cursor.lastrowid
            
            # Save markdown file
            file_path = self._save_markdown_file(
                folder_path,
                question_id,
                question_data['content']
            )
            
            conn.commit()
            conn.close()
            
            logger.info(f"Question {question_id} added successfully")
            
            return {
                'status': 'success',
                'message': f'Question added successfully (ID: {question_id})',
                'data': {
                    'id': question_id,
                    'title': question_data['title'],
                    'file_path': file_path,
                    'created_at': datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error adding question: {str(e)}")
            return {
                'status': 'error',
                'message': f'Error adding question: {str(e)}'
            }
    
    def update_question(self, question_id: int, question_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing question
        
        Args:
            question_id: ID of question to update
            question_data: Dictionary with updated fields
            
        Returns:
            Response dictionary with status
        """
        try:
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            # Check if question exists
            cursor.execute('SELECT * FROM questions WHERE id = ?', (question_id,))
            if not cursor.fetchone():
                return {
                    'status': 'error',
                    'message': f'Question {question_id} not found'
                }
            
            # Build update query dynamically
            allowed_fields = ['title', 'question_type', 'subject', 'topic', 'subtopic',
                            'difficulty_level', 'estimated_time', 'bloom_level']
            
            update_fields = []
            update_values = []
            
            for field in allowed_fields:
                if field in question_data:
                    update_fields.append(f'{field} = ?')
                    update_values.append(question_data[field])
            
            if not update_fields:
                return {
                    'status': 'error',
                    'message': 'No valid fields to update'
                }
            
            update_values.append(question_id)
            
            query = f"UPDATE questions SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, update_values)
            
            # Update markdown file if content is provided
            if 'content' in question_data:
                cursor.execute('SELECT subject, topic, subtopic FROM questions WHERE id = ?', 
                             (question_id,))
                subject, topic, subtopic = cursor.fetchone()
                
                folder_path = self._create_folder_structure(subject, topic, subtopic)
                self._save_markdown_file(folder_path, question_id, question_data['content'])
            
            conn.commit()
            conn.close()
            
            logger.info(f"Question {question_id} updated successfully")
            
            return {
                'status': 'success',
                'message': f'Question {question_id} updated successfully'
            }
            
        except Exception as e:
            logger.error(f"Error updating question: {str(e)}")
            return {
                'status': 'error',
                'message': f'Error updating question: {str(e)}'
            }
    
    def delete_question(self, question_id: int) -> Dict[str, Any]:
        """
        Delete a question
        
        Args:
            question_id: ID of question to delete
            
        Returns:
            Response dictionary with status
        """
        try:
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            # Get question details before deletion
            cursor.execute('SELECT subject, topic, subtopic FROM questions WHERE id = ?', 
                         (question_id,))
            result = cursor.fetchone()
            
            if not result:
                return {
                    'status': 'error',
                    'message': f'Question {question_id} not found'
                }
            
            subject, topic, subtopic = result
            
            # Delete from database
            cursor.execute('DELETE FROM questions WHERE id = ?', (question_id,))
            
            # Delete markdown file
            folder_path = self._create_folder_structure(subject, topic, subtopic)
            file_path = folder_path / f"{question_id}.md"
            if file_path.exists():
                file_path.unlink()
            
            conn.commit()
            conn.close()
            
            logger.info(f"Question {question_id} deleted successfully")
            
            return {
                'status': 'success',
                'message': f'Question {question_id} deleted successfully'
            }
            
        except Exception as e:
            logger.error(f"Error deleting question: {str(e)}")
            return {
                'status': 'error',
                'message': f'Error deleting question: {str(e)}'
            }
    
    def get_question(self, question_id: int) -> Dict[str, Any]:
        """
        Get a specific question with its content
        
        Args:
            question_id: ID of question to retrieve
            
        Returns:
            Response dictionary with question data
        """
        try:
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, title, question_type, subject, topic, subtopic,
                       difficulty_level, estimated_time, bloom_level, is_ai_generated,
                       created_at
                FROM questions WHERE id = ?
            ''', (question_id,))
            
            row = cursor.fetchone()
            if not row:
                return {
                    'status': 'error',
                    'message': f'Question {question_id} not found'
                }
            
            # Read markdown file
            subject, topic, subtopic = row[3], row[4], row[5]
            folder_path = self._create_folder_structure(subject, topic, subtopic)
            file_path = folder_path / f"{question_id}.md"
            
            content = ""
            if file_path.exists():
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            
            conn.close()
            
            return {
                'status': 'success',
                'question': {
                    'id': row[0],
                    'title': row[1],
                    'question_type': row[2],
                    'subject': row[3],
                    'topic': row[4],
                    'subtopic': row[5],
                    'difficulty_level': row[6],
                    'estimated_time': row[7],
                    'bloom_level': row[8],
                    'is_ai_generated': bool(row[9]),
                    'created_at': row[10],
                    'content': content
                }
            }
            
        except Exception as e:
            logger.error(f"Error retrieving question: {str(e)}")
            return {
                'status': 'error',
                'message': f'Error retrieving question: {str(e)}'
            }
    
    def get_all_questions(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get all questions with optional filters
        
        Args:
            filters: Optional dictionary with filter criteria
            
        Returns:
            Response dictionary with questions list
        """
        try:
            conn = sqlite3.connect(self.database_path)
            cursor = conn.cursor()
            
            query = '''
                SELECT id, title, question_type, subject, topic, subtopic,
                       difficulty_level, estimated_time, bloom_level, is_ai_generated,
                       created_at
                FROM questions
            '''
            
            params = []
            
            # Apply filters if provided
            if filters:
                conditions = []
                
                if 'subject' in filters:
                    conditions.append('subject = ?')
                    params.append(filters['subject'])
                
                if 'topic' in filters:
                    conditions.append('topic = ?')
                    params.append(filters['topic'])
                
                if 'difficulty_level' in filters:
                    conditions.append('difficulty_level = ?')
                    params.append(filters['difficulty_level'])
                
                if 'question_type' in filters:
                    conditions.append('question_type = ?')
                    params.append(filters['question_type'])
                
                if conditions:
                    query += ' WHERE ' + ' AND '.join(conditions)
            
            query += ' ORDER BY created_at DESC'
            
            cursor.execute(query, params)
            
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
                    'is_ai_generated': bool(row[9]),
                    'created_at': row[10]
                })
            
            conn.close()
            
            return {
                'status': 'success',
                'questions': questions,
                'total': len(questions)
            }
            
        except Exception as e:
            logger.error(f"Error retrieving questions: {str(e)}")
            return {
                'status': 'error',
                'message': f'Error retrieving questions: {str(e)}'
            }
    
    def _create_folder_structure(self, subject: str, topic: str, 
                                subtopic: Optional[str] = None) -> Path:
        """Create folder structure for organizing questions"""
        subject_path = self.question_bank_folder / subject
        subject_path.mkdir(exist_ok=True)
        
        topic_path = subject_path / topic
        topic_path.mkdir(exist_ok=True)
        
        if subtopic and subtopic.strip():
            subtopic_path = topic_path / subtopic
            subtopic_path.mkdir(exist_ok=True)
            return subtopic_path
        
        return topic_path
    
    def _save_markdown_file(self, folder_path: Path, question_id: int, 
                           content: str) -> str:
        """Save markdown content to file"""
        file_path = folder_path / f"{question_id}.md"
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return str(file_path)

