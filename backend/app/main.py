import re
from fastapi import FastAPI, HTTPException, Query, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from app.database import (
    init_db, save_note, get_all_notes, get_note, delete_note,
    search_notes_semantic, get_reminders, update_reminder_status,
    create_user, authenticate_user, get_user_by_session, delete_session
)
from app.gemini_service import (
    analyze_note, get_embedding, generate_rag_answer,
    generate_weekly_digest, summarize_link
)
from app.reminder_service import process_note_for_reminders

app = FastAPI(title="SmartRecall API", description="AI-powered Knowledge App Backend (Supabase + pgvector)")

# Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    init_db()

# Pydantic Schemas
class NoteCreate(BaseModel):
    content: str
    url: Optional[str] = None

class SearchQuery(BaseModel):
    query: str

class ChatQuery(BaseModel):
    query: str

class UserAuth(BaseModel):
    username: str
    password: str

# Helper to get current user from session token
def get_current_user(authorization: Optional[str] = Header(None)) -> int:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization header format")
        token = parts[1]
        user_id = get_user_by_session(token)
        if not user_id:
            raise HTTPException(status_code=401, detail="Session expired or invalid")
        return user_id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# Helper to check if string is a URL
def is_url(text: str) -> bool:
    url_pattern = re.compile(
        r'^(?:http|ftp)s?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return bool(url_pattern.match(text.strip()))

@app.get("/")
def read_root():
    from app.gemini_service import IS_MOCK_MODE
    return {
        "message": "Welcome to SmartRecall API",
        "mode": "MOCK" if IS_MOCK_MODE else "PRODUCTION (Gemini Connected)",
        "status": "online"
    }

@app.post("/api/auth/register")
def register_user(auth_data: UserAuth):
    username = auth_data.username.strip()
    password = auth_data.password.strip()
    if not username or not password:
        raise HTTPException(status_code=400, detail="Username and password cannot be empty")
    user_id = create_user(username, password)
    if not user_id:
        raise HTTPException(status_code=400, detail="Username already exists")
    return {"success": True, "message": "User registered successfully"}

@app.post("/api/auth/login")
def login_user(auth_data: UserAuth):
    username = auth_data.username.strip()
    password = auth_data.password.strip()
    token = authenticate_user(username, password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"success": True, "token": token, "username": username}

@app.post("/api/auth/logout")
def logout_user(authorization: Optional[str] = Header(None)):
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            delete_session(parts[1])
    return {"success": True}


@app.post("/api/notes")
def create_new_note(note_data: NoteCreate, current_user: int = Depends(get_current_user)):
    content = note_data.content.strip()
    url = note_data.url
    
    if not content:
        raise HTTPException(status_code=400, detail="Note content cannot be empty")
        
    summary = None
    # Auto-detect if content is a URL and extract/summarize it
    if is_url(content):
        url = content
        print(f"URL detected: {url}. Running link auto-summarization...")
        link_data = summarize_link(url)
        summary = link_data.get("summary")
        content = f"Saved Link: {link_data.get('title', url)}\nURL: {url}"
        
    # Analyze note content to get Category and Tags
    # If it was a link, analyze the summary context
    analysis_input = f"{content}\n{summary or ''}"
    analysis = analyze_note(analysis_input)
    category = analysis.get("category", "Personal")
    tags = analysis.get("tags", [])
    if not summary:
        summary = analysis.get("summary")
        
    # Generate Embedding vector (based on content + summary)
    embedding_input = f"{content}\nSummary: {summary or ''}"
    embedding = get_embedding(embedding_input)
    
    # Save to database
    note_id = save_note(
        content=content,
        url=url,
        summary=summary,
        category=category,
        tags=tags,
        embedding=embedding,
        user_id=current_user
    )
    
    # Process for date-aware reminders
    reminder_date = process_note_for_reminders(note_id, content)
    
    saved_note = get_note(note_id)
    if saved_note:
        # Remove raw embedding vector from API response to reduce payload size
        saved_note.pop("embedding", None)
        
    return {
        "success": True,
        "note": saved_note,
        "reminder_scheduled": reminder_date is not None,
        "reminder_date": reminder_date
    }

@app.get("/api/notes")
def list_notes(
    category: Optional[str] = Query(None, description="Filter notes by category"),
    tag: Optional[str] = Query(None, description="Filter notes by tag"),
    current_user: int = Depends(get_current_user)
):
    notes = get_all_notes(category=category, tag=tag, user_id=current_user)
    # Strip embeddings for response
    for note in notes:
        note.pop("embedding", None)
    return notes

@app.delete("/api/notes/{note_id}")
def delete_existing_note(note_id: int, current_user: int = Depends(get_current_user)):
    # Verify ownership
    note = get_note(note_id)
    if not note or note.get("user_id") != current_user:
        raise HTTPException(status_code=404, detail="Note not found")
        
    success = delete_note(note_id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"success": True, "message": "Note deleted successfully"}

@app.post("/api/search")
def search_notes(search_data: SearchQuery, current_user: int = Depends(get_current_user)):
    query = search_data.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
        
    # Get embedding for search query
    query_embedding = get_embedding(query)
    
    # Run similarity search
    results = search_notes_semantic(query_embedding, limit=5, user_id=current_user)
    return results

@app.post("/api/chat")
def chat_with_notes(chat_data: ChatQuery, current_user: int = Depends(get_current_user)):
    query = chat_data.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Chat query cannot be empty")
        
    # 1. Get embedding for the user's chat query
    query_embedding = get_embedding(query)
    
    # 2. Retrieve top 3 relevant notes context
    matching_notes = search_notes_semantic(query_embedding, limit=3, user_id=current_user)
    
    # 3. Generate synthesized response using RAG
    answer = generate_rag_answer(query, matching_notes)
    
    return {
        "answer": answer,
        "sources": [{"id": n["id"], "summary": n["summary"], "category": n["category"]} for n in matching_notes]
    }

@app.get("/api/summary/weekly")
def get_weekly_summary(current_user: int = Depends(get_current_user)):
    notes = get_all_notes(user_id=current_user)
    # If mock database is empty, return a nice empty message
    if not notes:
        return {"summary": "You haven't saved any notes yet! Start saving notes to generate a weekly summary."}
        
    # Generate weekly digest summary
    summary_text = generate_weekly_digest(notes)
    return {"summary": summary_text}

@app.get("/api/reminders")
def list_all_reminders(
    status: Optional[str] = Query(None, description="Filter by pending or completed"),
    current_user: int = Depends(get_current_user)
):
    return get_reminders(status=status, user_id=current_user)

@app.post("/api/reminders/{reminder_id}/complete")
def complete_reminder(reminder_id: int, current_user: int = Depends(get_current_user)):
    # Verify that the reminder belongs to a note owned by current_user
    reminders = get_reminders(user_id=current_user)
    reminder_ids = [r["id"] for r in reminders]
    if reminder_id not in reminder_ids:
        raise HTTPException(status_code=404, detail="Reminder not found")
        
    success = update_reminder_status(reminder_id, "completed")
    if not success:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"success": True, "message": "Reminder marked as completed"}

