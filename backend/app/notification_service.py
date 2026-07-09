"""
SmartRecall — notification_service.py
Background push notification delivery via Expo's free Push API.
Runs as an APScheduler job (every hour) and also on-demand.
"""
import httpx

from app.database import get_due_reminders_with_tokens, mark_reminder_notified

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

# Expo push API accepts up to 100 messages per batch request
EXPO_BATCH_SIZE = 100


def send_expo_push(token: str, title: str, body: str, data: dict = None) -> bool:
    """
    Sends a single push notification to one Expo push token.
    Uses Expo's free push API — no API key required.
    Returns True if Expo accepted the message, False otherwise.
    """
    payload = {
        "to": token,
        "title": title,
        "body": body,
        "sound": "default",
        "priority": "high",
        "data": data or {},
    }
    try:
        with httpx.Client(timeout=15) as client:
            response = client.post(
                EXPO_PUSH_URL,
                json=[payload],
                headers={"Accept": "application/json", "Content-Type": "application/json"},
            )
            result = response.json()
            ticket = result.get("data", [{}])[0]
            if ticket.get("status") == "ok":
                return True
            else:
                print(f"⚠️  Expo push rejected: {ticket.get('message', 'unknown error')}")
                return False
    except Exception as exc:
        print(f"❌ Failed to reach Expo Push API: {exc}")
        return False


def send_due_reminder_notifications() -> int:
    """
    Scheduler job — called every hour by APScheduler.
    1. Queries all pending reminders due today that haven't been notified yet
    2. For each, sends an Expo push notification
    3. Stamps notified_at so they won't re-fire
    Returns the count of notifications sent.
    """
    try:
        due = get_due_reminders_with_tokens()
        if not due:
            print("📭 No due reminders to notify.")
            return 0

        print(f"📬 {len(due)} reminder(s) due — sending push notifications …")
        sent_count = 0

        for reminder in due:
            token = reminder.get("push_token")
            if not token:
                continue

            # Build notification content
            preview = reminder.get("note_content", "")[:50]
            title = "⏰ SmartRecall Reminder"
            body = reminder.get("message") or f"Reminder about: {preview}"

            data = {
                "reminder_id": reminder["id"],
                "note_id": reminder["note_id"],
                "type": "reminder",
            }

            ok = send_expo_push(token, title, body, data)
            if ok:
                mark_reminder_notified(reminder["id"])
                sent_count += 1
                print(f"  ✅ Reminder #{reminder['id']} notified (note #{reminder['note_id']})")
            else:
                print(f"  ❌ Failed to notify reminder #{reminder['id']}")

        print(f"📬 Done — {sent_count}/{len(due)} notification(s) delivered.")
        return sent_count

    except Exception as exc:
        print(f"❌ Notification scheduler error: {exc}")
        return 0
