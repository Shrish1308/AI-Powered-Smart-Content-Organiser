# API Reference

The Smart Recall frontend communicates with a FastAPI backend running at the URL defined in `src/constants/api.js` (currently defaulting to `http://10.105.160.215:8000`).

## Authentication Headers
All protected routes require an `Authorization` header containing a valid JWT.
```
Authorization: Bearer <token>
```

## Endpoints

### Auth
- `POST /register`: Register a new user account.
- `POST /token`: Login to retrieve a JWT (OAuth2 Password Bearer format).

### Notes & Memories
- `POST /notes`: Save a new raw note or link. The backend will trigger Gemini to categorize, tag, and summarize.
- `GET /notes`: Retrieve all saved notes for the authenticated user.
- `GET /notes/search?q={query}`: Perform a semantic vector search across the user's notes.
- `DELETE /notes/{id}`: Delete a specific note.
- `PUT /notes/{id}`: Update an existing note's raw content.

### Chat & RAG
- `POST /chat`: Send a message to the Gemini AI. The backend will automatically inject the user's relevant semantic notes into the LLM context window to provide personalized answers.

### Reminders & Nudges
- `GET /reminders`: Retrieve scheduled reminders.
- `PUT /reminders/{id}/complete`: Mark a reminder as completed.
- `POST /reminders`: (Internal API typically triggered by note analysis) Schedule a new reminder.

### Analytics
- `GET /digest`: Retrieve a weekly summary/digest of the user's activity.
