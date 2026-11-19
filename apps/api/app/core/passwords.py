"""Local password hashing (when Supabase Auth is not configured)."""

from __future__ import annotations

import bcrypt

DEMO_PASSWORD = "CreatorsDemo1!"


def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain: str, password_hash: str | None) -> bool:
    if not password_hash or not plain:
        return False
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


def password_policy_errors(password: str) -> list[str]:
    errors: list[str] = []
    if len(password) < 8:
        errors.append("Use a password with at least 8 characters.")
    if password != password.strip() or " " in password:
        errors.append("Password must not contain spaces.")
    if not any(char.isupper() for char in password):
        errors.append("Include at least one uppercase letter.")
    if not any(char.islower() for char in password):
        errors.append("Include at least one lowercase letter.")
    if not any(char.isdigit() for char in password):
        errors.append("Include at least one number.")
    return errors


def assert_password_policy(password: str) -> None:
    from fastapi import HTTPException

    errors = password_policy_errors(password)
    if errors:
        raise HTTPException(status_code=422, detail=errors[0])