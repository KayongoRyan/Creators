from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.ids import new_id, now_iso
from app.core.passwords import assert_password_policy, hash_password, verify_password
from app.core.security import _decode, _role_from_claims, encode_access_token
from app.db.models import Brand, Creator, PendingSignup, Profile

VALID_ROLES = {"admin", "brand", "creator"}
PORTAL_SIGNUP_ROLES = {"brand", "creator"}
OTP_BYPASS_TOKEN = "000000"
PENDING_TTL = timedelta(hours=24)


def _clean_email(email: str) -> str:
    cleaned = email.strip().lower()
    if not cleaned or "@" not in cleaned:
        raise HTTPException(status_code=422, detail="Email is required")
    return cleaned


def _require_role(role: str) -> str:
    if role not in VALID_ROLES:
        raise HTTPException(status_code=422, detail="Unknown role")
    return role


def _require_portal_role(role: str) -> str:
    role = _require_role(role)
    if role not in PORTAL_SIGNUP_ROLES:
        raise HTTPException(status_code=422, detail="Use admin signup for admin accounts")
    return role


def _auth_headers(*, service: bool = False) -> dict[str, str]:
    settings = get_settings()
    if not settings.supabase_url:
        raise HTTPException(status_code=503, detail="Supabase Auth is not configured")
    if service:
        key = settings.supabase_service_role_key
    else:
        key = settings.supabase_anon_key or settings.supabase_service_role_key
    if not key:
        raise HTTPException(status_code=503, detail="Supabase Auth is not configured")
    if not service and not settings.supabase_anon_key.strip():
        raise HTTPException(
            status_code=503,
            detail="SUPABASE_ANON_KEY is required for email OTP signup",
        )
    return {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


def _supabase_error_detail(response: httpx.Response) -> str:
    try:
        body = response.json()
    except Exception:
        return response.text[:300] if response.text else "Auth request failed"
    if isinstance(body, dict):
        for key in ("msg", "error_description", "error", "message"):
            value = body.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    return "Auth request failed"


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
        detail = _supabase_error_detail(response).lower()
        if "email_not_confirmed" in detail or "not confirmed" in detail:
            raise HTTPException(
                status_code=401,
                detail="Verify your email first. Check your inbox for the code.",
            )
        raise HTTPException(status_code=401, detail="Wrong password")
    body = response.json()
    token = body.get("access_token")
    if not isinstance(token, str) or not token:
        raise HTTPException(status_code=401, detail="Wrong password")
    return token


def _create_auth_user(*, email: str, password: str, role: str, display_name: str) -> str:
    """Admin / bypass provisioning only — confirms email immediately."""
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


def _repair_profile_links(db: Session, profile: Profile) -> None:
    """Backfill creator/brand rows when profiles lost foreign keys after DB wipes."""
    _attach_role_links(db, profile, profile.role)
    db.flush()


def _onboarding_dict(onboarding: dict[str, Any] | None) -> dict[str, Any]:
    if not onboarding:
        return {}
    return {key: value for key, value in onboarding.items() if value not in (None, "", [])}


def _apply_onboarding(db: Session, profile: Profile, payload: dict[str, Any]) -> None:
    onboarding = payload.get("onboarding") if isinstance(payload.get("onboarding"), dict) else payload
    if not isinstance(onboarding, dict):
        return
    display_name = str(payload.get("display_name") or profile.display_name).strip()
    if display_name:
        profile.display_name = display_name

    if profile.role == "creator" and profile.creator_id:
        creator = db.get(Creator, profile.creator_id)
        if creator is not None:
            if display_name:
                creator.display_name = display_name
            phone = str(onboarding.get("phone") or "").strip()
            if phone:
                creator.phone = phone
                creator.momo = phone
            niches = onboarding.get("niches")
            if isinstance(niches, list) and niches:
                creator.niche = ", ".join(str(item).strip() for item in niches if str(item).strip())

    if profile.role == "brand" and profile.brand_id:
        brand = db.get(Brand, profile.brand_id)
        if brand is not None:
            business_name = str(onboarding.get("business_name") or display_name).strip()
            if business_name:
                brand.name = business_name
                brand.legal_name = business_name
                profile.display_name = business_name
            business_type = str(onboarding.get("business_type") or "").strip()
            if business_type:
                brand.company_line = business_type


def _ensure_profile_for_supabase_user(
    db: Session,
    *,
    access_token: str,
    email: str,
    role: str,
) -> Profile:
    """Link Supabase Auth users to public.profiles when DB rows were wiped or never remapped."""
    profile = db.query(Profile).filter(Profile.email == email).one_or_none()
    if profile is not None:
        if profile.role != role:
            raise HTTPException(status_code=401, detail="Wrong password")
        return profile

    try:
        claims = _decode(access_token)
    except HTTPException as exc:
        raise HTTPException(status_code=401, detail="Wrong password") from exc
    sub = claims.get("sub")
    if not isinstance(sub, str) or not sub:
        raise HTTPException(status_code=502, detail="Supabase Auth returned no user id")
    meta_role = _role_from_claims(claims)
    if meta_role and meta_role != role:
        raise HTTPException(status_code=401, detail="Wrong password")

    user_meta = claims.get("user_metadata") or {}
    display_name = (
        user_meta.get("display_name") if isinstance(user_meta, dict) else None
    )
    name = (display_name or email.split("@")[0]).strip() or email.split("@")[0]
    profile = Profile(id=sub, email=email, role=role, display_name=str(name))
    _attach_role_links(db, profile, role)
    db.add(profile)
    db.flush()
    if isinstance(user_meta, dict):
        _apply_onboarding(db, profile, {"display_name": name, "onboarding": user_meta})
        db.flush()
    return profile


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


def _local_login(db: Session, *, cleaned: str, password: str, role: str) -> dict:
    profile = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if profile is None or profile.role != role:
        raise HTTPException(status_code=401, detail="Wrong password")
    if not verify_password(password, profile.password_hash):
        raise HTTPException(status_code=401, detail="Wrong password")
    return _token_payload(profile)


def _local_signup(
    db: Session,
    *,
    cleaned: str,
    password: str,
    role: str,
    name: str,
) -> dict:
    settings = get_settings()
    if role == "admin" and not settings.auth_dev:
        raise HTTPException(status_code=403, detail="Admin accounts are provisioned by the platform team.")
    profile = Profile(
        id=new_id("profile"),
        email=cleaned,
        role=role,
        display_name=name,
        password_hash=hash_password(password),
    )
    _attach_role_links(db, profile, role)
    db.add(profile)
    db.flush()
    return _token_payload(profile)


def _upsert_pending(
    db: Session,
    *,
    email: str,
    role: str,
    payload: dict[str, Any],
    supabase_user_id: str | None,
) -> PendingSignup:
    now = datetime.now(UTC)
    expires = (now + PENDING_TTL).isoformat()
    created = now_iso()
    existing = db.query(PendingSignup).filter(PendingSignup.email == email).one_or_none()
    if existing is not None:
        existing.role = role
        existing.payload = payload
        existing.supabase_user_id = supabase_user_id
        existing.expires_at = expires
        existing.created_at = created
        db.flush()
        return existing
    row = PendingSignup(
        id=new_id("ps"),
        email=email,
        role=role,
        payload=payload,
        supabase_user_id=supabase_user_id,
        expires_at=expires,
        created_at=created,
    )
    db.add(row)
    db.flush()
    return row


def _get_pending(db: Session, email: str) -> PendingSignup:
    row = db.query(PendingSignup).filter(PendingSignup.email == email).one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail="No pending signup for that email")
    try:
        expires = datetime.fromisoformat(row.expires_at.replace("Z", "+00:00"))
    except ValueError:
        expires = datetime.now(UTC) - timedelta(seconds=1)
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    if expires < datetime.now(UTC):
        db.delete(row)
        db.flush()
        raise HTTPException(status_code=410, detail="Signup code expired. Start signup again.")
    return row


def _friendly_signup_error(detail: str) -> str:
    lowered = detail.lower()
    if "rate limit" in lowered:
        return (
            "Too many signup emails from this project. Wait a few minutes, "
            "configure custom SMTP, or set AUTH_EMAIL_OTP_BYPASS=1 for local dev."
        )
    if "invalid" in lowered and "email" in lowered:
        return "That email address was rejected. Use a real inbox address."
    return detail


def _public_signup(email: str, password: str, metadata: dict[str, Any]) -> str | None:
    settings = get_settings()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/signup"
    payload = {
        "email": email,
        "password": password,
        "data": metadata,
    }
    try:
        response = httpx.post(
            url,
            headers=_auth_headers(service=False),
            json=payload,
            timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Supabase Auth") from exc
    if response.status_code in {400, 422} and "already" in response.text.lower():
        raise HTTPException(status_code=409, detail="Email is already registered")
    if response.status_code >= 400:
        raise HTTPException(
            status_code=400,
            detail=_friendly_signup_error(_supabase_error_detail(response)),
        )
    body = response.json() if response.content else {}
    user = body.get("user") if isinstance(body, dict) else None
    if isinstance(user, dict):
        user_id = user.get("id")
        if isinstance(user_id, str) and user_id:
            return user_id
    user_id = body.get("id") if isinstance(body, dict) else None
    return user_id if isinstance(user_id, str) else None


def _verify_signup_otp(email: str, token: str) -> dict:
    settings = get_settings()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/verify"
    try:
        response = httpx.post(
            url,
            headers=_auth_headers(service=False),
            json={"type": "signup", "email": email, "token": token},
            timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Supabase Auth") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=401, detail="Invalid or expired verification code")
    body = response.json()
    if not isinstance(body, dict):
        raise HTTPException(status_code=502, detail="Supabase Auth returned an invalid response")
    return body


def _resend_signup_otp(email: str) -> None:
    settings = get_settings()
    url = f"{settings.supabase_url.rstrip('/')}/auth/v1/resend"
    try:
        response = httpx.post(
            url,
            headers=_auth_headers(service=False),
            json={"type": "signup", "email": email},
            timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not reach Supabase Auth") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=400, detail=_supabase_error_detail(response))


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


def signup_start(
    db: Session,
    *,
    email: str,
    password: str,
    role: str,
    display_name: str | None,
    onboarding: dict[str, Any] | None = None,
) -> dict:
    role = _require_portal_role(role)
    cleaned = _clean_email(email)
    assert_password_policy(password)
    existing = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email is already registered")

    name = (display_name or cleaned.split("@")[0]).strip() or cleaned.split("@")[0]
    onboard = _onboarding_dict(onboarding)
    payload = {
        "display_name": name,
        "password_hash": hash_password(password),
        "onboarding": onboard,
    }

    settings = get_settings()
    if not settings.supabase_auth_enabled or settings.email_otp_bypass_enabled:
        _upsert_pending(
            db,
            email=cleaned,
            role=role,
            payload=payload,
            supabase_user_id=None,
        )
        return {
            "needsVerification": True,
            "email": cleaned,
            "role": role,
            "bypass": settings.email_otp_bypass_enabled,
        }

    metadata = {
        "display_name": name,
        "role": role,
        **onboard,
    }
    try:
        user_id = _public_signup(cleaned, password, metadata)
    except HTTPException as exc:
        # Local/dev without SMTP hits Supabase email rate limits fast — fall back to OTP bypass.
        detail = str(exc.detail).lower()
        if settings.auth_dev and ("rate limit" in detail or "smtp" in detail):
            _upsert_pending(
                db,
                email=cleaned,
                role=role,
                payload=payload,
                supabase_user_id=None,
            )
            return {
                "needsVerification": True,
                "email": cleaned,
                "role": role,
                "bypass": True,
            }
        raise
    _upsert_pending(
        db,
        email=cleaned,
        role=role,
        payload={**payload, "password_hash": None},
        supabase_user_id=user_id,
    )
    return {
        "needsVerification": True,
        "email": cleaned,
        "role": role,
    }


def signup_verify(
    db: Session,
    *,
    email: str,
    token: str,
    role: str,
) -> dict:
    role = _require_portal_role(role)
    cleaned = _clean_email(email)
    code = token.strip()
    if not code:
        raise HTTPException(status_code=422, detail="Verification code is required")

    existing = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if existing is not None:
        if existing.role != role:
            raise HTTPException(status_code=409, detail="Email is already registered with another role")
        return _token_payload(existing)

    pending = _get_pending(db, cleaned)
    if pending.role != role:
        raise HTTPException(status_code=409, detail="Role does not match pending signup")

    settings = get_settings()
    payload = pending.payload if isinstance(pending.payload, dict) else {}
    name = str(payload.get("display_name") or cleaned.split("@")[0])

    if not settings.supabase_auth_enabled or settings.email_otp_bypass_enabled:
        if settings.email_otp_bypass_enabled and code != OTP_BYPASS_TOKEN:
            raise HTTPException(status_code=401, detail="Invalid or expired verification code")
        if not settings.supabase_auth_enabled and code != OTP_BYPASS_TOKEN:
            # Local auth without Supabase: accept any 6-digit code in tests/dev after start.
            if not (code.isdigit() and len(code) == 6):
                raise HTTPException(status_code=401, detail="Invalid or expired verification code")
        profile = Profile(
            id=new_id("profile"),
            email=cleaned,
            role=role,
            display_name=name,
            password_hash=payload.get("password_hash"),
        )
        _attach_role_links(db, profile, role)
        db.add(profile)
        db.flush()
        _apply_onboarding(db, profile, payload)
        db.delete(pending)
        db.flush()
        return _token_payload(profile)

    verified = _verify_signup_otp(cleaned, code)
    access_token = verified.get("access_token")
    user = verified.get("user") if isinstance(verified.get("user"), dict) else {}
    user_id = user.get("id") if isinstance(user, dict) else None
    if not isinstance(user_id, str) or not user_id:
        if isinstance(access_token, str):
            claims = _decode(access_token)
            sub = claims.get("sub")
            user_id = sub if isinstance(sub, str) else None
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(status_code=502, detail="Supabase Auth returned no user id")

    profile = Profile(
        id=user_id,
        email=cleaned,
        role=role,
        display_name=name,
    )
    _attach_role_links(db, profile, role)
    db.add(profile)
    db.flush()
    _apply_onboarding(db, profile, payload)
    db.delete(pending)
    db.flush()
    return _token_payload(profile)


def signup_resend(db: Session, *, email: str, role: str | None = None) -> dict:
    cleaned = _clean_email(email)
    pending = _get_pending(db, cleaned)
    if role is not None and pending.role != _require_portal_role(role):
        raise HTTPException(status_code=409, detail="Role does not match pending signup")

    settings = get_settings()
    if not settings.supabase_auth_enabled or settings.email_otp_bypass_enabled:
        return {"ok": True, "email": cleaned, "bypass": settings.email_otp_bypass_enabled}

    _resend_signup_otp(cleaned)
    return {"ok": True, "email": cleaned}


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
    assert_password_policy(password)
    existing = db.query(Profile).filter(Profile.email == cleaned).one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="Email is already registered")
    name = (display_name or cleaned.split("@")[0]).strip() or cleaned.split("@")[0]

    settings = get_settings()
    if role in PORTAL_SIGNUP_ROLES and settings.supabase_auth_enabled and not settings.email_otp_bypass_enabled:
        raise HTTPException(
            status_code=422,
            detail="Use /auth/signup/start and /auth/signup/verify for creator and brand accounts",
        )

    if not settings.supabase_auth_enabled:
        return _local_signup(db, cleaned=cleaned, password=password, role=role, name=name)

    # Admin (or OTP bypass) still uses confirmed admin-user create.
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
    _password_grant(cleaned, password)
    return _token_payload(profile)


def login(db: Session, *, email: str, password: str, role: str) -> dict:
    role = _require_role(role)
    cleaned = _clean_email(email)
    if not password:
        raise HTTPException(status_code=422, detail="Password is required")

    if not get_settings().supabase_auth_enabled:
        _local_login(db, cleaned=cleaned, password=password, role=role)
        profile = db.query(Profile).filter(Profile.email == cleaned).one()
    else:
        access_token = _password_grant(cleaned, password)
        profile = _ensure_profile_for_supabase_user(
            db,
            access_token=access_token,
            email=cleaned,
            role=role,
        )
    _repair_profile_links(db, profile)
    return _token_payload(profile)
