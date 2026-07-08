"""
SmartRecall — auth.py
Centralised authentication utilities:
  - bcrypt password hashing (direct bcrypt package — no passlib)
  - JWT creation and verification via python-jose
"""
import os
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from dotenv import load_dotenv
from jose import JWTError, jwt

load_dotenv()

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

SECRET_KEY: str = os.environ.get(
    "JWT_SECRET_KEY",
    "smartrecall-change-this-in-production"  # fallback for safety
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30  # long-lived tokens — good UX for mobile apps

BCRYPT_ROUNDS = 12  # work factor: higher = slower hash = harder to brute-force


# ---------------------------------------------------------------------------
# Password hashing (direct bcrypt — compatible with bcrypt 4.x)
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    """
    Hashes a password with bcrypt (12 rounds, built-in random salt).
    bcrypt has a hard 72-byte limit — passwords longer than that are rejected
    here with a clear ValueError rather than silently truncated or crashing.
    """
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        raise ValueError("Password must be 72 characters or fewer.")
    salt = bcrypt.gensalt(rounds=BCRYPT_ROUNDS)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored bcrypt hash.
    Returns False gracefully for any error (e.g. legacy SHA-256 hashes).
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT tokens
# ---------------------------------------------------------------------------

def create_access_token(user_id: int, username: str) -> str:
    """
    Creates a signed JWT carrying the user's id and username.
    Token is valid for ACCESS_TOKEN_EXPIRE_DAYS days.
    """
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),   # 'sub' is the standard JWT claim for the user id
        "username": username,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """
    Verifies the JWT signature and expiry.
    Returns the decoded payload dict on success, or None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
