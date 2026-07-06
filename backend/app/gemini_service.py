import os
import json
import re
import hashlib
from typing import List, Dict, Any, Tuple, Optional
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Try loading Google Generative AI SDK (optional fallback)
try:
    import google.generativeai as genai
    HAS_GEMINI_SDK = True
except ImportError:
    genai = None
    HAS_GEMINI_SDK = False

API_KEY = os.environ.get("GEMINI_API_KEY")
IS_MOCK_MODE = not bool(API_KEY) or not HAS_GEMINI_SDK

if not IS_MOCK_MODE and HAS_GEMINI_SDK:
    try:
        genai.configure(api_key=API_KEY)
        print("Gemini API Configured. Running in PRODUCTION mode.")
    except Exception as e:
        print(f"Error configuring Gemini SDK: {e}. Falling back to MOCK mode.")
        IS_MOCK_MODE = True
else:
    if not HAS_GEMINI_SDK:
        print("Google Generative AI SDK not installed. Running in MOCK/SIMULATION mode.")
    else:
        print("No GEMINI_API_KEY found. Running in MOCK/SIMULATION mode.")


def get_mock_tags_and_category(text: str) -> Dict[str, Any]:
    """Fallback generator for categorization and tagging when no API key is present."""
    text_lower = text.lower()
    
    # Simple keyword routing
    if any(k in text_lower for k in ["study", "exam", "learn", "course", "class", "lecture", "book", "tutorial", "python", "code", "programming"]):
        category = "Study"
        tags = ["learning"]
        if "python" in text_lower or "code" in text_lower or "programming" in text_lower:
            tags.append("coding")
        if "exam" in text_lower:
            tags.append("exam")
    elif any(k in text_lower for k in ["work", "meeting", "office", "deadline", "project", "task", "job", "invoice", "client"]):
        category = "Work"
        tags = ["productivity"]
        if "project" in text_lower:
            tags.append("project")
        if "meeting" in text_lower:
            tags.append("meeting")
    elif any(k in text_lower for k in ["health", "workout", "fitness", "diet", "gym", "exercise", "doctor", "med", "calories"]):
        category = "Health"
        tags = ["wellness"]
        if "workout" in text_lower or "gym" in text_lower:
            tags.append("fitness")
        if "diet" in text_lower:
            tags.append("nutrition")
    elif any(k in text_lower for k in ["finance", "money", "budget", "spend", "cost", "price", "stock", "crypto", "buy"]):
        category = "Finance"
        tags = ["finance"]
        if "budget" in text_lower or "spend" in text_lower:
            tags.append("budgeting")
    else:
        category = "Personal"
        tags = ["general"]
        
    # Generate mock summary snippet
    words = text.split()
    summary_words = words[:15]
    summary = " ".join(summary_words) + ("..." if len(words) > 15 else "")
    summary = f"Saved info about: {summary}"
    
    return {
        "category": category,
        "tags": tags,
        "summary": summary
    }


def get_mock_embedding(text: str) -> List[float]:
    """Generates a deterministic 3072-dim float vector for a given text using hashing.
    Matches the real dimension of gemini-embedding-001 so mock mode and
    production mode are always compatible with the same database column.
    """
    vector = [0.0] * 3072
    # Clean and split text to get unique terms
    words = re.findall(r'\w+', text.lower())
    if not words:
        words = ["empty"]

    # Generate components of the vector based on word hashes
    for word in words:
        h = hashlib.sha256(word.encode('utf-8')).hexdigest()
        # Derive coordinates from hex chunks
        for i in range(12):  # Use hash parts to populate parts of the vector
            idx = int(h[i*2:(i+1)*2], 16) % 3072
            vector[idx] += 1.0

    # Normalize vector to unit length
    magnitude = sum(x * x for x in vector) ** 0.5
    if magnitude > 0:
        vector = [x / magnitude for x in vector]

    return vector


def get_embedding(text: str) -> List[float]:
    """Generates a vector embedding using Google Gemini Embeddings API."""
    if IS_MOCK_MODE:
        return get_mock_embedding(text)
        
    try:
        response = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return response['embedding']
    except Exception as e:
        print(f"Error generating embedding via Gemini API: {e}. Falling back to mock embedding.")
        return get_mock_embedding(text)


def analyze_note(text: str) -> Dict[str, Any]:
    """Calls Gemini to automatically extract category, tags, and summary."""
    if IS_MOCK_MODE:
        return get_mock_tags_and_category(text)
        
    try:
        model = genai.GenerativeModel(
            model_name='gemini-2.5-flash',
            generation_config={"response_mime_type": "application/json"}
        )
        
        prompt = (
            "Analyze the following text. Categorize it into one of these categories: "
            "'Study', 'Work', 'Health', 'Finance', 'Personal', 'Other'.\n"
            "Provide 1 to 5 relevant lowercase tags (e.g. ['coding', 'ideas', 'workout']).\n"
            "Provide a concise 1-2 sentence summary summarizing the text.\n"
            "Return a JSON object with keys: 'category', 'tags', and 'summary'.\n\n"
            f"Text:\n{text}"
        )
        
        response = model.generate_content(prompt)
        result = json.loads(response.text.strip())
        return {
            "category": result.get("category", "Other"),
            "tags": result.get("tags", []),
            "summary": result.get("summary", text[:100] + "...")
        }
    except Exception as e:
        print(f"Error calling Gemini for analysis: {e}. Falling back to mock generator.")
        return get_mock_tags_and_category(text)


def extract_date_context(text: str) -> Optional[str]:
    """Extracts date contexts from text (e.g., 'exam on 15th of June', 'meeting tomorrow').
    Returns YYYY-MM-DD format if found, otherwise None.
    """
    # Quick local regex check for common format: "exam on YYYY-MM-DD" or similar
    match = re.search(r'\b(202\d-\d{2}-\d{2})\b', text)
    if match:
        return match.group(1)
        
    # Check relative dates locally
    text_lower = text.lower()
    from datetime import datetime, timedelta
    today = datetime.now()
    
    if "tomorrow" in text_lower:
        return (today + timedelta(days=1)).strftime("%Y-%m-%d")
    elif "next week" in text_lower:
        return (today + timedelta(days=7)).strftime("%Y-%m-%d")
        
    if IS_MOCK_MODE:
        # Check for simple patterns like "on 15th"
        # Since it's mockup, check if there is a number
        num_match = re.search(r'\bon\b\s+(\d{1,2})', text_lower)
        if num_match:
            day = int(num_match.group(1))
            current_month = today.month
            current_year = today.year
            # If date has passed, assume next month
            if day < today.day:
                current_month += 1
                if current_month > 12:
                    current_month = 1
                    current_year += 1
            try:
                return f"{current_year:04d}-{current_month:02d}-{day:02d}"
            except ValueError:
                pass
        return None
        
    try:
        model = genai.GenerativeModel(model_name='gemini-2.5-flash')
        prompt = (
            "Determine if the following text contains any future tasks, deadlines, appointments, or date references. "
            "If it does, extract the target date and return it strictly in 'YYYY-MM-DD' format. "
            "If it does not contain a date reference, return 'NONE'.\n"
            f"Current local date/time: {today.strftime('%Y-%m-%d %A')}\n\n"
            f"Text:\n{text}"
        )
        response = model.generate_content(prompt)
        date_str = response.text.strip()
        
        # Validate format
        if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
            return date_str
        return None
    except Exception as e:
        print(f"Error extracting date context: {e}")
        return None


def generate_rag_answer(query: str, matching_notes: List[Dict[str, Any]]) -> str:
    """Uses retrieved notes context to answer user query using RAG."""
    if not matching_notes:
        return "You haven't saved any notes related to that topic yet. Try saving some notes first!"
        
    context = ""
    for i, note in enumerate(matching_notes):
        context += f"[Note {i+1}] (Category: {note['category']}, Tags: {', '.join(note['tags'])}):\n{note['content']}\n"
        if note.get('summary'):
            context += f"Summary: {note['summary']}\n"
        context += "---\n"
        
    if IS_MOCK_MODE:
        # Mock answers based on matched notes
        top_note = matching_notes[0]
        answer = (
            f"Based on your saved note in **{top_note['category']}**:\n\n"
            f"> \"{top_note['content']}\"\n\n"
            f"I found this match (confidence score: {top_note.get('similarity', 0.85):.2f}). "
            "Please configure the Gemini API key in `backend/.env` to get full AI synthesis!"
        )
        return answer
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = (
            "You are SmartRecall, an intelligent, personal notes assistant. "
            "Answer the user's question accurately using only the saved notes provided below as context.\n"
            "If the provided notes context does not contain the answer, explain politely that you couldn't find "
            "that information in their saved notes, but summarize whatever closest information is present.\n"
            "Be conversational, concise, and structure your answer with clear bullet points if applicable.\n\n"
            f"User Question: {query}\n\n"
            f"Context (User's Saved Notes):\n{context}\n\n"
            "SmartRecall Answer:"
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error answering query: {e}. Here is the top match context:\n\n{matching_notes[0]['content']}"


def generate_weekly_digest(notes: List[Dict[str, Any]]) -> str:
    """Generates a weekly digest summary of saved notes grouped by category."""
    if not notes:
        return "You didn't save any notes this week. Start saving thoughts, files, or links to see a weekly digest!"
        
    notes_by_cat = {}
    for note in notes:
        cat = note['category'] or "Uncategorized"
        if cat not in notes_by_cat:
            notes_by_cat[cat] = []
        notes_by_cat[cat].append(note)
        
    notes_data_str = ""
    for cat, items in notes_by_cat.items():
        notes_data_str += f"### Category: {cat}\n"
        for note in items:
            notes_data_str += f"- Note: {note['content']}\n"
            if note.get('summary'):
                notes_data_str += f"  Summary: {note['summary']}\n"
        notes_data_str += "\n"
        
    if IS_MOCK_MODE:
        # Mock weekly digest
        digest = "## SmartRecall Weekly Digest (Simulation Mode)\n\n"
        for cat, items in notes_by_cat.items():
            digest += f"### {cat} ({len(items)} notes saved)\n"
            digest += f"- Highlights: Reviewed topics regarding {', '.join(items[0]['tags'])}.\n"
        digest += "\n*Enable the Gemini API Key to receive a full intelligent weekly summary!*"
        return digest
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = (
            "Review the user's weekly saved notes below, which are grouped by category.\n"
            "Write a beautiful, motivational weekly summary that highlights:\n"
            "1. A high-level overview of what the user focused on this week.\n"
            "2. Summary insights organized by category.\n"
            "3. Action items or key takeaways to recall.\n"
            "Format the output using markdown headers, bullet points, and clean lists.\n\n"
            f"Notes data:\n{notes_data_str}\n\n"
            "Weekly Digest:"
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Could not generate weekly summary: {e}"


def fetch_url_content(url: str) -> Tuple[str, str]:
    """Fetches a URL and extracts its main title and body text."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string.strip() if soup.title else "Webpage"
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
            
        # Get text
        text = soup.get_text(separator=' ')
        # Break into lines and remove leading and trailing space on each
        lines = (line.strip() for line in text.splitlines())
        # Break multi-headlines into a line each
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        # Drop blank lines
        text_content = '\n'.join(chunk for chunk in chunks if chunk)
        
        # Limit context text size
        text_content = text_content[:3000]
        return title, text_content
    except Exception as e:
        print(f"Error scraping URL: {e}")
        return "Webpage Link", f"This is a webpage link saved from {url}. Could not fetch full content."


def summarize_link(url: str) -> Dict[str, Any]:
    """Scrapes content from a link and uses Gemini to write a summary."""
    title, content = fetch_url_content(url)
    
    if IS_MOCK_MODE:
        return {
            "title": title,
            "summary": f"Summary for {title}: Saved reference link to {url}. (Configure Gemini API key to enable web scraping auto-summaries)."
        }
        
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = (
            "Summarize the following scraped content of a webpage in 3 clear bullet points. "
            "Write the summary in the third person. Keep it under 100 words.\n\n"
            f"Title: {title}\n"
            f"URL: {url}\n"
            f"Content:\n{content}\n\n"
            "Summary:"
        )
        response = model.generate_content(prompt)
        return {
            "title": title,
            "summary": response.text.strip()
        }
    except Exception as e:
        print(f"Error generating link summary: {e}")
        return {
            "title": title,
            "summary": f"Web reference to {title}. (Failed to generate AI summary)"
        }
