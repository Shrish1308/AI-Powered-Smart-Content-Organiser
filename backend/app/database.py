import sqlite3
import json
import os
import math
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "smart_recall.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create notes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            url TEXT,
            summary TEXT,
            category TEXT,
            tags TEXT, -- JSON array of tags: ["tag1", "tag2"]
            embedding TEXT, -- JSON array of floats
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create reminders table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            note_id INTEGER,
            reminder_date TEXT NOT NULL, -- YYYY-MM-DD
            message TEXT NOT NULL,
            status TEXT DEFAULT 'pending', -- pending, completed
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
        )
    ''')
    
    conn.commit()
    conn.close()

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    
    # Try using numpy for speed if available, otherwise fallback to pure python
    try:
        import numpy as np
        dot_product = np.dot(v1, v2)
        norm_v1 = np.linalg.norm(v1)
        norm_v2 = np.linalg.norm(v2)
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return float(dot_product / (norm_v1 * norm_v2))
    except Exception:
        # Fallback to pure python
        dot_product = sum(x * y for x, y in zip(v1, v2))
        norm_v1 = math.sqrt(sum(x * x for x in v1))
        norm_v2 = math.sqrt(sum(y * y for y in v2))
        if norm_v1 == 0 or norm_v2 == 0:
            return 0.0
        return dot_product / (norm_v1 * norm_v2)

def save_note(content: str, url: Optional[str] = None, summary: Optional[str] = None, 
              category: Optional[str] = None, tags: List[str] = [], 
              embedding: Optional[List[float]] = None) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    tags_str = json.dumps(tags)
    embedding_str = json.dumps(embedding) if embedding else None
    
    cursor.execute('''
        INSERT INTO notes (content, url, summary, category, tags, embedding)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (content, url, summary, category, tags_str, embedding_str))
    
    note_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return note_id

def get_note(note_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM notes WHERE id = ?', (note_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        note = dict(row)
        note['tags'] = json.loads(note['tags']) if note['tags'] else []
        if note['embedding']:
            note['embedding'] = json.loads(note['embedding'])
        return note
    return None

def get_all_notes(category: Optional[str] = None, tag: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM notes'
    params = []
    
    if category:
        query += ' WHERE category = ?'
        params.append(category)
        
    query += ' ORDER BY created_at DESC'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    notes = []
    for row in rows:
        note = dict(row)
        note['tags'] = json.loads(note['tags']) if note['tags'] else []
        if note['embedding']:
            note['embedding'] = json.loads(note['embedding'])
        
        # If tag filter is specified, filter in python (since it's a JSON array in SQLite)
        if tag and tag not in note['tags']:
            continue
            
        notes.append(note)
        
    return notes

def search_notes_semantic(query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
    """Retrieves all notes and ranks them by cosine similarity to the query embedding."""
    if not query_embedding:
        return []
        
    notes = get_all_notes()
    scored_notes = []
    
    for note in notes:
        if not note.get('embedding'):
            continue
        similarity = cosine_similarity(query_embedding, note['embedding'])
        # Add similarity score to output note metadata
        note_copy = note.copy()
        # Remove raw embedding from return value to save bandwidth
        note_copy.pop('embedding', None)
        note_copy['similarity'] = similarity
        scored_notes.append(note_copy)
        
    # Sort by similarity score descending
    scored_notes.sort(key=lambda x: x['similarity'], reverse=True)
    return scored_notes[:limit]

def delete_note(note_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM notes WHERE id = ?', (note_id,))
    changes = conn.total_changes
    conn.commit()
    conn.close()
    return changes > 0

def save_reminder(note_id: int, reminder_date: str, message: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reminders (note_id, reminder_date, message, status)
        VALUES (?, ?, ?, 'pending')
    ''', (note_id, reminder_date, message))
    reminder_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return reminder_id

def get_reminders(status: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT r.*, n.content as note_content, n.category as note_category
        FROM reminders r
        JOIN notes n ON r.note_id = n.id
    '''
    params = []
    
    if status:
        query += ' WHERE r.status = ?'
        params.append(status)
        
    query += ' ORDER BY r.reminder_date ASC'
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def update_reminder_status(reminder_id: int, status: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE reminders SET status = ? WHERE id = ?', (status, reminder_id))
    changes = conn.total_changes
    conn.commit()
    conn.close()
    return changes > 0
