import json
import os
from typing import List, Dict, Any, Optional

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

from app.auth import hash_password

load_dotenv()

# ---------------------------------------------------------------------------
# Connection
# ---------------------------------------------------------------------------

SUPABASE_DB_URL = os.environ.get("SUPABASE_DB_URL")


def get_db_connection():
    """Returns a psycopg2 connection to Supabase PostgreSQL."""
    if not SUPABASE_DB_URL:
        raise RuntimeError(
            "SUPABASE_DB_URL is not set in the environment. "
            "Add it to backend/.env and restart the server."
        )
    conn = psycopg2.connect(SUPABASE_DB_URL)
    return conn


# ---------------------------------------------------------------------------
# Schema Initialisation
# ---------------------------------------------------------------------------

def init_db():
    """Creates all required tables and enables pgvector if not already set up."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Enable pgvector extension (idempotent)
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    # NOTE: No sessions table — authentication is stateless via JWT.
    # Tokens are signed with JWT_SECRET_KEY and verified on every request
    # without any database round-trip.

    # Notes table — embedding stored as native vector(3072) for pgvector
    # gemini-embedding-001 returns 3072-dimensional vectors by default
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id SERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            url TEXT,
            summary TEXT,
            category TEXT,
            tags JSONB DEFAULT '[]'::jsonb,
            embedding vector(3072),
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    conn.commit()

    # ── Dimension migration ───────────────────────────────────────────────────
    # pgvector stores the column dimension in pg_attribute.atttypmod.
    # If the column already exists as vector(768) we need to drop and re-add it
    # because PostgreSQL cannot resize a vector type in place.
    try:
        cursor.execute("""
            SELECT pa.atttypmod
            FROM pg_attribute pa
            JOIN pg_class pc ON pa.attrelid = pc.oid
            WHERE pc.relname = 'notes'
              AND pa.attname = 'embedding'
              AND pa.attnum > 0;
        """)
        row = cursor.fetchone()
        current_dim = row[0] if row else None

        if current_dim is not None and current_dim != 3072:
            print(f"⚠️  Embedding column has dimension {current_dim}, migrating to 3072 …")
            # Must drop the index before altering the column
            cursor.execute("DROP INDEX IF EXISTS notes_embedding_idx;")
            cursor.execute("ALTER TABLE notes DROP COLUMN IF EXISTS embedding;")
            cursor.execute("ALTER TABLE notes ADD COLUMN embedding vector(3072);")
            conn.commit()
            print("✅ Embedding column successfully migrated to vector(3072)")
        else:
            conn.rollback()  # nothing changed — discard read-only transaction
    except Exception as mig_err:
        conn.rollback()
        print(f"⚠️  Dimension check skipped (non-fatal): {mig_err}")

    # ── ANN index ─────────────────────────────────────────────────────────────
    # Wrapped in try/except — ivfflat requires ≥ lists rows; may fail on empty table
    try:
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS notes_embedding_idx
            ON notes USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 50);
        """)
        conn.commit()
    except Exception as idx_err:
        print(f"⚠️  Could not create ivfflat index (non-fatal): {idx_err}")
        conn.rollback()

    # Reminders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reminders (
            id SERIAL PRIMARY KEY,
            note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
            reminder_date TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)

    conn.commit()
    cursor.close()
    conn.close()
    print("✅ Database initialised successfully (Supabase PostgreSQL + pgvector).")



# ---------------------------------------------------------------------------
# Auth Helpers
# ---------------------------------------------------------------------------
# Password hashing (bcrypt) and JWT utilities live in app/auth.py.
# database.py only handles the DB side: storing/looking up users.

def create_user(username: str, password: str) -> Optional[int]:
    """Creates a new user with a bcrypt-hashed password. Returns user_id or None if username taken."""
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = hash_password(password)  # bcrypt via auth.py
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id;",
            (username, password_hash),
        )
        user_id = cursor.fetchone()[0]
        conn.commit()
        return user_id
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        return None
    finally:
        cursor.close()
        conn.close()


def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
    """Fetches a user row by username. Returns dict with id, username, password_hash or None."""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "SELECT id, username, password_hash FROM users WHERE username = %s;",
        (username,),
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return dict(row) if row else None


# ---------------------------------------------------------------------------
# Note Operations
# ---------------------------------------------------------------------------

def _row_to_note(row: dict) -> dict:
    """Normalises a raw database row into a clean note dict."""
    note = dict(row)
    # tags arrives as a Python list already (psycopg2 deserialises JSONB)
    if isinstance(note.get("tags"), str):
        note["tags"] = json.loads(note["tags"])
    elif note.get("tags") is None:
        note["tags"] = []
    # created_at → ISO string for JSON serialisation
    if note.get("created_at") and not isinstance(note["created_at"], str):
        note["created_at"] = note["created_at"].strftime("%Y-%m-%d %H:%M:%S")
    return note


def save_note(
    content: str,
    url: Optional[str] = None,
    summary: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
    embedding: Optional[List[float]] = None,
    user_id: Optional[int] = None,
) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()

    tags_json = json.dumps(tags if tags is not None else [])

    # Convert the embedding list to a PostgreSQL vector literal string
    embedding_str = (
        "[" + ",".join(str(x) for x in embedding) + "]" if embedding else None
    )

    # Use two separate INSERT statements so we never try to cast NULL to vector
    if embedding_str is not None:
        cursor.execute(
            """
            INSERT INTO notes (content, url, summary, category, tags, embedding, user_id)
            VALUES (%s, %s, %s, %s, %s::jsonb, %s::vector, %s)
            RETURNING id;
            """,
            (content, url, summary, category, tags_json, embedding_str, user_id),
        )
    else:
        cursor.execute(
            """
            INSERT INTO notes (content, url, summary, category, tags, embedding, user_id)
            VALUES (%s, %s, %s, %s, %s::jsonb, NULL, %s)
            RETURNING id;
            """,
            (content, url, summary, category, tags_json, user_id),
        )
    note_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return note_id


def get_note(note_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "SELECT id, content, url, summary, category, tags, user_id, created_at FROM notes WHERE id = %s;",
        (note_id,),
    )
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    return _row_to_note(row) if row else None


def get_all_notes(
    category: Optional[str] = None,
    tag: Optional[str] = None,
    user_id: Optional[int] = None,
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Build query dynamically — we never fetch the embedding column here
    # so that we don't waste bandwidth moving 768-float arrays to Python
    conditions: List[str] = []
    params: List[Any] = []

    if user_id is not None:
        conditions.append("user_id = %s")
        params.append(user_id)

    if category:
        conditions.append("category = %s")
        params.append(category)

    if tag:
        # Use PostgreSQL JSONB contains operator to filter by tag value
        conditions.append("tags @> %s::jsonb")
        params.append(json.dumps([tag]))

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    # embedding is intentionally excluded from this query — it's large (3072 floats)
    # and not needed for list/digest views. Semantic search has its own dedicated
    # search_notes_semantic() which selects embedding only when comparing vectors.
    cursor.execute(
        f"""
        SELECT id, content, url, summary, category, tags, user_id, created_at
        FROM notes
        {where_clause}
        ORDER BY created_at DESC;
        """,
        params,
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [_row_to_note(r) for r in rows]


def search_notes_semantic(
    query_embedding: List[float], limit: int = 5, user_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Uses pgvector's native cosine distance operator (<=>)  to rank notes by
    semantic similarity entirely inside PostgreSQL — no Python-side maths needed.
    """
    if not query_embedding:
        return []

    embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    user_filter = "AND user_id = %s" if user_id is not None else ""
    params: List[Any] = [embedding_str]
    if user_id is not None:
        params.append(user_id)
    params.append(embedding_str)
    params.append(limit)

    cursor.execute(
        f"""
        SELECT
            id, content, url, summary, category, tags, user_id, created_at,
            1 - (embedding <=> %s::vector) AS similarity
        FROM notes
        WHERE embedding IS NOT NULL
        {user_filter}
        ORDER BY embedding <=> %s::vector ASC
        LIMIT %s;
        """,
        params,
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    results = []
    for row in rows:
        note = _row_to_note(row)
        note["similarity"] = float(note.get("similarity", 0))
        results.append(note)
    return results


def delete_note(note_id: int) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = %s;", (note_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    cursor.close()
    conn.close()
    return deleted


# ---------------------------------------------------------------------------
# Reminder Operations
# ---------------------------------------------------------------------------

def save_reminder(note_id: int, reminder_date: str, message: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO reminders (note_id, reminder_date, message, status)
        VALUES (%s, %s, %s, 'pending')
        RETURNING id;
        """,
        (note_id, reminder_date, message),
    )
    reminder_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return reminder_id


def get_reminders(
    status: Optional[str] = None, user_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    conditions: List[str] = []
    params: List[Any] = []

    if user_id is not None:
        conditions.append("n.user_id = %s")
        params.append(user_id)

    if status:
        conditions.append("r.status = %s")
        params.append(status)

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    cursor.execute(
        f"""
        SELECT r.id, r.note_id, r.reminder_date, r.message, r.status, r.created_at,
               n.content AS note_content, n.category AS note_category
        FROM reminders r
        JOIN notes n ON r.note_id = n.id
        {where_clause}
        ORDER BY r.reminder_date ASC;
        """,
        params,
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    results = []
    for row in rows:
        r = dict(row)
        if r.get("created_at") and not isinstance(r["created_at"], str):
            r["created_at"] = r["created_at"].strftime("%Y-%m-%d %H:%M:%S")
        results.append(r)
    return results


def update_reminder_status(reminder_id: int, status: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE reminders SET status = %s WHERE id = %s;", (status, reminder_id)
    )
    updated = cursor.rowcount > 0
    conn.commit()
    cursor.close()
    conn.close()
    return updated
