from datetime import datetime, timedelta
from typing import Optional
from app.database import save_reminder
from app.gemini_service import extract_date_context

def process_note_for_reminders(note_id: int, content: str) -> Optional[str]:
    """Analyzes a note for any date mentions, and schedules a reminder 1 day before the event."""
    target_date_str = extract_date_context(content)
    if not target_date_str:
        return None
        
    try:
        target_date = datetime.strptime(target_date_str, "%Y-%m-%d")
        # Set reminder for 1 day before the target date
        reminder_date = target_date - timedelta(days=1)
        
        # If target date is today or tomorrow, set reminder for today
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        if reminder_date < today:
            reminder_date = today
            
        reminder_date_str = reminder_date.strftime("%Y-%m-%d")
        
        # Create preview of note content
        preview = content[:40] + ("..." if len(content) > 40 else "")
        message = f"SmartRecall Nudge: Revisit note '{preview}' (Scheduled event: {target_date_str})"
        
        # Save reminder to database
        save_reminder(note_id, reminder_date_str, message)
        return reminder_date_str
    except Exception as e:
        print(f"Error processing note reminders: {e}")
        return None
