from __future__ import annotations

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.ids import new_id
from app.core.security import encode_access_token
from app.db.models import Brand, Creator, Profile

VALID_ROLES = {"admin", "brand", "creator"}


def _clean_email(email: str) -> str:
    cleaned = email.strip().lower()
    if not cleaned or "@" not in cleaned:
        raise HTTPException(status_code=422, detail="Email is required")
    return cleaned


def _require_role(role: str) -> str:
    if role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail="Unknown role")
    return role


def _auth_headers(*, service: bool = False) -> dict[str, str]:
    settings = get_settings()
    if not settings.supabase_url:
        raise HTTPException(status_code=503, detail="Supabase Auth is not configured")
    key = (
        settings.supabase_service_role_key
        if service
        else (settings.supabase_anon_key or settings.supabase_service_role_key)
    )
    if not key:
        raise HTTPException(status_code=503, detail="Supabase Auth is not configured")
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _password_grant(email: str, password: str) -> str:
    settings = get_settings()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/token?grant_type=password"
    try:
        response = httpx.post(
            url,
            headers=_auth_headers(service=False),
            json={"email": email, "password": password},
            timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Supabase Auth") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=401, detail="Wrong password")
    body = response.json()
    token = body.get("access_token")
    if not isinstance(token, str) or not token:
        raise HTTPException(status_code=401, detail="Wrong password")
    return token


def _create_auth_user(*, email: str, password: str, role: str, display_name: str) -> str:
    settings = get_settings()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users"
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {"display_name": display_name},
        "app_metadata": {"role": role},
    }
    try:
        response = httpx.post(
            url,
            headers=_auth_headers(service=True),
            json=payload,
            timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Supabase Auth") from exc
    if response.status_code in {400, 422} and "already" in response.text.lower():
        raise HTTPException(status_code=409, detail="Email is already registered")
    if response.status_code >= 400:
        raise HTTPException(status_code=400, detail="Could not create that account")
    user_id = response.json().get("id")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(status_code=502, detail="Supabase Auth returned no user id")
    return user_id


def _attach_role_links(db: Session, profile: Profile, role: str) -> None:
    if role == "creator" and not profile.creator_id:
        creator = Creator(
            id=new_id("cr"),
            display_name=profile.display_name,
            label="New",
        )
        db.add(creator)
        profile.creator_id = creator.id
    elif role == "brand" and not profile.brand_id:
        brand = Brand(
            id=new_id("br"),
            name=profile.display_name,
            legal_name=profile.display_name,
            company_line="",
        )
        db.add(brand)
        profile.brand_id = brand.id


def _token_payload(profile: Profile, access_token: str | None = None) -> dict:
    return {
        "accessToken": access_token
        or encode_access_token(
            profile_id=profile.id,
            email=profile.email,
            role=profile.role,
        ),
        "tokenType": "bearer",
        "role": profile.role,
        "email": profile.email,
    }


def issue_dev_token(db: Session, *, role: str, email: str, display_name: str | None) -> dict:
    """Lookup-only helper for local tests. Never creates profiles."""
    if not get_settings().auth_dev:
        raise HTTPException(status_code=404, detail="Not found")
    role = _require_role(role)
    cleaned = _clean_email(email)
    profile = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if profile is None:
        raise HTTPException(status_code=401, detail="No account found for that email")
    if profile.role != role:
        raise HTTPException(status_code=409, detail="Email is already registered with another role")
    return _token_payload(profile)


def signup(
    db: Session,
    *,
    email: str,
    password: str,
    role: str,
    display_name: str | None,
) -> dict:
    role = _require_role(role)
    cleaned = _clean_email(email)
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Use a password with at least 8 characters")
    existing = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email is already registered")
    name = (display_name or cleaned.split("@")[0]).strip() or cleaned.split("@")[0]
    user_id = _create_auth_user(
        email=cleaned,
        password=password,
        role=role,
        display_name=name,
    )
    profile = Profile(
        id=user_id,
        email=cleaned,
        role=role,
        display_name=name,
    )
    _attach_role_links(db, profile, role)
    db.add(profile)
    db.flush()
    access_token = _password_grant(cleaned, password)
    return _token_payload(profile, access_token)


def login(db: Session, *, email: str, password: str, role: str) -> dict:
    role = _require_role(role)
    cleaned = _clean_email(email)
    if not password:
        raise HTTPException(status_code=422, detail="Password is required")
    access_token = _password_grant(cleaned, password)
    profile = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if profile is None or profile.role != role:
        raise HTTPException(status_code=401, detail="Wrong password")
    return _token_payload(profile, access_token)
