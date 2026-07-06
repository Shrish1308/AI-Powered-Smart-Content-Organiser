"""
SmartRecall — Supabase connection test script.
Run from the backend directory:
    python test_supabase.py
"""
import os
import sys

# Load .env from the backend directory
from dotenv import load_dotenv
load_dotenv()

print("=" * 60)
print("SmartRecall — Supabase + pgvector Connection Test")
print("=" * 60)

# ── 1. Check psycopg2 is importable ──────────────────────────────
try:
    import psycopg2
    import psycopg2.extras
    print("✅ psycopg2 installed:", psycopg2.__version__)
except ImportError:
    print("❌ psycopg2-binary is NOT installed.")
    print("   Run:  pip install psycopg2-binary")
    sys.exit(1)

# ── 2. Check env var ─────────────────────────────────────────────
db_url = os.environ.get("SUPABASE_DB_URL")
if not db_url:
    print("❌ SUPABASE_DB_URL is missing from backend/.env")
    sys.exit(1)
print("✅ SUPABASE_DB_URL found in environment")

# ── 3. Connect to Supabase ───────────────────────────────────────
try:
    conn = psycopg2.connect(db_url)
    print("✅ Connected to Supabase PostgreSQL successfully!")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)

# ── 4. Check pgvector extension ───────────────────────────────────
try:
    cursor = conn.cursor()
    cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    conn.commit()
    cursor.execute("SELECT extversion FROM pg_extension WHERE extname = 'vector';")
    row = cursor.fetchone()
    if row:
        print(f"✅ pgvector extension enabled (version: {row[0]})")
    else:
        print("⚠️  pgvector extension not found — it may need to be enabled in Supabase dashboard")
    cursor.close()
except Exception as e:
    print(f"❌ pgvector check failed: {e}")
    conn.rollback()

# ── 5. Run init_db ───────────────────────────────────────────────
try:
    conn.close()
    from app.database import init_db
    init_db()
    print("✅ init_db() completed — all tables created/verified")
except Exception as e:
    print(f"❌ init_db() failed: {e}")
    sys.exit(1)

# ── 6. Quick round-trip: create user, save note, search ──────────
try:
    from app.database import (
        create_user, authenticate_user, save_note,
        get_all_notes, search_notes_semantic, delete_note
    )

    # Register a test user (ignore duplicate)
    uid = create_user("__test_user__", "testpass123")
    if uid:
        print(f"✅ Test user created (id={uid})")
    else:
        print("ℹ️  Test user already exists — re-authenticating")
        token = authenticate_user("__test_user__", "testpass123")
        # We need the user_id; fetch it directly
        import psycopg2
        conn2 = psycopg2.connect(db_url)
        c2 = conn2.cursor()
        c2.execute("SELECT id FROM users WHERE username = '__test_user__';")
        uid = c2.fetchone()[0]
        c2.close()
        conn2.close()

    # Save a note with a mock 768-dim embedding
    mock_embedding = [0.01] * 768
    note_id = save_note(
        content="This is a Supabase connection test note",
        category="Study",
        tags=["test", "supabase"],
        embedding=mock_embedding,
        user_id=uid,
    )
    print(f"✅ Test note saved (id={note_id})")

    # Semantic search
    results = search_notes_semantic(mock_embedding, limit=3, user_id=uid)
    print(f"✅ Semantic search returned {len(results)} result(s)")
    if results:
        print(f"   Top match: '{results[0]['content']}' — similarity={results[0]['similarity']:.4f}")

    # Clean up test note
    delete_note(note_id)
    print("✅ Test note cleaned up")

except Exception as e:
    print(f"❌ Round-trip test failed: {e}")
    sys.exit(1)

print()
print("=" * 60)
print("🎉 All checks passed! Your Supabase backend is ready.")
print("=" * 60)
