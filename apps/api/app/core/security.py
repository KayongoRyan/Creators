from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from functools import lru_cache

import jwt
from fastapi import HTTPException
from jwt import PyJWKClient
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import Profile


@dataclass
class Actor:
    role: str
    email: str
    profile_id: str | None
    brand_id: str | None
    creator_id: str | None


def encode_access_token(*, profile_id: str, email: str, role: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": profile_id,
        "email": email,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(days=7)).timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


@lru_cache
def _jwks_client(supabase_url: str) -> PyJWKClient:
    return PyJWKClient(f"{supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json")


def _decode_supabase_asymmetric(token: str) -> dict:
    settings = get_settings()
    if not settings.supabase_url:
        raise jwt.InvalidTokenError("Supabase URL is not configured")
    key = _jwks_client(settings.supabase_url).get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        key.key,
        algorithms=["ES256", "RS256"],
        audience="authenticated",
        options={"require": ["exp", "sub"]},
    )


def _decode(token: str) -> dict:
    settings = get_settings()
    header = jwt.get_unverified_header(token)
    alg = header.get("alg")
    last_error: Exception | None = None

    if alg in {"ES256", "RS256"}:
        try:
            return _decode_supabase_asymmetric(token)
        except Exception as exc:  # noqa: BLE001 - surface as 401 below
            last_error = exc

    secrets = [settings.jwt_secret]
    if settings.supabase_jwt_secret:
        secrets.insert(0, settings.supabase_jwt_secret)
    for secret in secrets:
        try:
            return jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options={"verify_aud": False},
            )
        except jwt.PyJWTError as exc:
            last_error = exc
    raise HTTPException(status_code=401, detail="Invalid access token") from last_error


def _role_from_claims(claims: dict) -> str | None:
    app_meta = claims.get("app_metadata") or {}
    user_meta = claims.get("user_metadata") or {}
    for candidate in (
        app_meta.get("role") if isinstance(app_meta, dict) else None,
        user_meta.get("role") if isinstance(user_meta, dict) else None,
        claims.get("app_role"),
        claims.get("role"),
    ):
        if candidate in {"admin", "brand", "creator"}:
            return str(candidate)
    return None


def actor_from_token(db: Session, token: str) -> Actor:
    claims = _decode(token)
    email = claims.get("email")
    sub = claims.get("sub")
    role = _role_from_claims(claims)
    profile: Profile | None = None
    if isinstance(sub, str):
        profile = db.get(Profile, sub)
    if profile is None and isinstance(email, str):
        profile = db.query(Profile).filter(Profile.email == email).one_or_none()
    if profile is not None:
        role = profile.role
        email = profile.email
        sub = profile.id
    if role not in {"admin", "brand", "creator"} or not isinstance(email, str):
        raise HTTPException(status_code=401, detail="Access token is missing a portal role")
    return Actor(
        role=role,
        email=email,
        profile_id=profile.id if profile else (sub if isinstance(sub, str) else None),
        brand_id=profile.brand_id if profile else None,
        creator_id=profile.creator_id if profile else None,
    )
