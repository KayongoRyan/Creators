from unittest.mock import MagicMock

import httpx

from app.core.db import session_factory
from app.core.passwords import DEMO_PASSWORD
from app.db.models import Profile


def test_dev_token_lookup_only_rejects_unknown(client) -> None:
    response = client.post(
        "/api/auth/dev-token",
        json={"role": "creator", "email": "nobody@example.com", "displayName": "Nobody"},
    )
    assert response.status_code == 401
    db = session_factory()()
    try:
        assert db.query(Profile).filter(Profile.email == "nobody@example.com").one_or_none() is None
    finally:
        db.close()


def test_dev_token_rejects_role_mismatch(client) -> None:
    response = client.post(
        "/api/auth/dev-token",
        json={"role": "admin", "email": "creator@ubunifu.dev", "displayName": "Nope"},
    )
    assert response.status_code == 409


def test_login_unknown_email_does_not_create_profile(client) -> None:
    before = session_factory()()
    try:
        count_before = before.query(Profile).count()
    finally:
        before.close()

    response = client.post(
        "/api/auth/login",
        json={"email": "ghost@example.com", "password": "Whatever1!", "role": "creator"},
    )
    assert response.status_code == 401

    after = session_factory()()
    try:
        assert after.query(Profile).count() == count_before
        assert after.query(Profile).filter(Profile.email == "ghost@example.com").one_or_none() is None
    finally:
        after.close()


def test_login_wrong_password(client) -> None:
    response = client.post(
        "/api/auth/login",
        json={
            "email": "creator@ubunifu.dev",
            "password": "wrong-password",
            "role": "creator",
        },
    )
    assert response.status_code == 401


def test_local_login_success(client) -> None:
    response = client.post(
        "/api/auth/login",
        json={
            "email": "creator@ubunifu.dev",
            "password": DEMO_PASSWORD,
            "role": "creator",
        },
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["role"] == "creator"
    assert body["accessToken"]


def test_signup_then_login(client) -> None:
    signup = client.post(
        "/api/auth/signup",
        json={
            "email": "new.creator@example.com",
            "password": "Password12",
            "role": "creator",
            "displayName": "New Creator",
        },
    )
    assert signup.status_code == 200, signup.text
    assert signup.json()["role"] == "creator"

    db = session_factory()()
    try:
        profile = db.query(Profile).filter(Profile.email == "new.creator@example.com").one()
        assert profile.id.startswith("profile_")
        assert profile.creator_id
        assert profile.password_hash
    finally:
        db.close()

    login = client.post(
        "/api/auth/login",
        json={
            "email": "new.creator@example.com",
            "password": "Password12",
            "role": "creator",
        },
    )
    assert login.status_code == 200
    assert login.json()["accessToken"]


def test_signup_rejects_weak_password(client) -> None:
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "weak@example.com",
            "password": "short",
            "role": "creator",
            "displayName": "Weak",
        },
    )
    assert response.status_code == 422


def test_signup_rejects_existing_email(client) -> None:
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "creator@ubunifu.dev",
            "password": "Password12",
            "role": "creator",
            "displayName": "Marie",
        },
    )
    assert response.status_code == 409


def test_login_role_mismatch(client) -> None:
    response = client.post(
        "/api/auth/login",
        json={
            "email": "creator@ubunifu.dev",
            "password": DEMO_PASSWORD,
            "role": "admin",
        },
    )
    assert response.status_code == 401


def test_signup_one_shot_rejected_when_supabase_enabled(client, monkeypatch) -> None:
    from app.core.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", "test-service-role")
    monkeypatch.setattr(settings, "supabase_anon_key", "test-anon-key")
    monkeypatch.setattr(settings, "auth_email_otp_bypass", False)

    response = client.post(
        "/api/auth/signup",
        json={
            "email": "supa.user@example.com",
            "password": "Password12",
            "role": "creator",
            "displayName": "Supa User",
        },
    )
    assert response.status_code == 422


def test_signup_start_verify_otp_flow(client) -> None:
    start = client.post(
        "/api/auth/signup/start",
        json={
            "email": "otp.creator@example.com",
            "password": "Password12",
            "role": "creator",
            "displayName": "Otp Creator",
            "onboarding": {
                "phone": "+250 700 000 001",
                "niches": ["Tech", "Lifestyle"],
            },
        },
    )
    assert start.status_code == 200, start.text
    body = start.json()
    assert body["needsVerification"] is True
    assert body["email"] == "otp.creator@example.com"

    db = session_factory()()
    try:
        assert db.query(Profile).filter(Profile.email == "otp.creator@example.com").one_or_none() is None
        from app.db.models import PendingSignup

        pending = db.query(PendingSignup).filter(PendingSignup.email == "otp.creator@example.com").one()
        assert pending.role == "creator"
    finally:
        db.close()

    verify = client.post(
        "/api/auth/signup/verify",
        json={
            "email": "otp.creator@example.com",
            "token": "123456",
            "role": "creator",
        },
    )
    assert verify.status_code == 200, verify.text
    token_body = verify.json()
    assert token_body["accessToken"]
    assert token_body["role"] == "creator"

    db = session_factory()()
    try:
        from app.db.models import Creator, PendingSignup

        profile = db.query(Profile).filter(Profile.email == "otp.creator@example.com").one()
        assert profile.creator_id
        creator = db.get(Creator, profile.creator_id)
        assert creator is not None
        assert creator.phone == "+250 700 000 001"
        assert "Tech" in creator.niche
        assert (
            db.query(PendingSignup).filter(PendingSignup.email == "otp.creator@example.com").one_or_none()
            is None
        )
    finally:
        db.close()

    headers = {"Authorization": f"Bearer {token_body['accessToken']}"}
    assert client.get("/api/creator/state", headers=headers).status_code == 200


def test_signup_start_verify_brand_onboarding(client) -> None:
    assert (
        client.post(
            "/api/auth/signup/start",
            json={
                "email": "otp.brand@example.com",
                "password": "Password12",
                "role": "brand",
                "displayName": "Contact Name",
                "onboarding": {
                    "businessName": "Acme Rwanda",
                    "businessType": "CPG",
                    "phone": "+250 700 000 002",
                },
            },
        ).status_code
        == 200
    )
    verify = client.post(
        "/api/auth/signup/verify",
        json={"email": "otp.brand@example.com", "token": "654321", "role": "brand"},
    )
    assert verify.status_code == 200, verify.text
    db = session_factory()()
    try:
        from app.db.models import Brand

        profile = db.query(Profile).filter(Profile.email == "otp.brand@example.com").one()
        brand = db.get(Brand, profile.brand_id)
        assert brand is not None
        assert brand.name == "Acme Rwanda"
        assert brand.company_line == "CPG"
    finally:
        db.close()


def test_signup_resend_local(client) -> None:
    assert (
        client.post(
            "/api/auth/signup/start",
            json={
                "email": "resend@example.com",
                "password": "Password12",
                "role": "creator",
                "displayName": "Resend",
            },
        ).status_code
        == 200
    )
    resend = client.post(
        "/api/auth/signup/resend",
        json={"email": "resend@example.com", "role": "creator"},
    )
    assert resend.status_code == 200, resend.text
    assert resend.json()["ok"] is True


def test_signup_then_login_supabase(client, monkeypatch) -> None:
    from app.core.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", "test-service-role")
    monkeypatch.setattr(settings, "supabase_anon_key", "test-anon-key")
    monkeypatch.setattr(settings, "auth_email_otp_bypass", False)

    def fake_post(url, **kwargs):
        response = MagicMock()
        response.text = ""
        path = str(url)
        if path.endswith("/auth/v1/signup"):
            response.status_code = 200
            response.json.return_value = {
                "user": {"id": "11111111-1111-1111-1111-111111111111"},
            }
            return response
        if path.endswith("/auth/v1/verify"):
            response.status_code = 200
            response.json.return_value = {
                "access_token": "supabase-access-token",
                "user": {"id": "11111111-1111-1111-1111-111111111111"},
            }
            return response
        if "grant_type=password" in path:
            response.status_code = 200
            response.json.return_value = {"access_token": "supabase-access-token"}
            return response
        response.status_code = 400
        response.json.return_value = {"msg": "unexpected"}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    start = client.post(
        "/api/auth/signup/start",
        json={
            "email": "supa.user@example.com",
            "password": "Password12",
            "role": "creator",
            "displayName": "Supa User",
        },
    )
    assert start.status_code == 200, start.text
    assert start.json()["needsVerification"] is True

    db = session_factory()()
    try:
        assert db.query(Profile).filter(Profile.email == "supa.user@example.com").one_or_none() is None
    finally:
        db.close()

    verify = client.post(
        "/api/auth/signup/verify",
        json={
            "email": "supa.user@example.com",
            "token": "424242",
            "role": "creator",
        },
    )
    assert verify.status_code == 200, verify.text
    body = verify.json()
    assert body["accessToken"]
    headers = {"Authorization": f"Bearer {body['accessToken']}"}
    assert client.get("/api/creator/state", headers=headers).status_code == 200


def test_login_maps_email_not_confirmed(client, monkeypatch) -> None:
    from app.core.config import get_settings

    settings = get_settings()
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", "test-service-role")
    monkeypatch.setattr(settings, "supabase_anon_key", "test-anon-key")

    def fake_post(url, **kwargs):
        response = MagicMock()
        response.status_code = 400
        response.text = '{"error_description":"Email not confirmed"}'
        response.json.return_value = {"error_description": "Email not confirmed"}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    response = client.post(
        "/api/auth/login",
        json={
            "email": "creator@ubunifu.dev",
            "password": DEMO_PASSWORD,
            "role": "creator",
        },
    )
    assert response.status_code == 401
    assert "Verify your email" in response.json()["detail"]


def test_password_forgot_always_ok_unknown_email(client) -> None:
    response = client.post(
        "/api/auth/password/forgot",
        json={"email": "nobody-reset@example.com"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["ok"] is True


def test_password_forgot_reset_local_then_login(client) -> None:
    email = "reset.local@example.com"
    old_password = "Password12"
    new_password = "NewPassword99"

    assert (
        client.post(
            "/api/auth/signup",
            json={
                "email": email,
                "password": old_password,
                "role": "creator",
                "displayName": "Reset Local",
            },
        ).status_code
        == 200
    )

    forgot = client.post("/api/auth/password/forgot", json={"email": email})
    assert forgot.status_code == 200, forgot.text
    assert forgot.json()["ok"] is True
    assert forgot.json()["expiresIn"] == 60

    reset = client.post(
        "/api/auth/password/reset",
        json={"email": email, "token": "000000", "password": new_password},
    )
    assert reset.status_code == 200, reset.text
    body = reset.json()
    assert body["accessToken"]
    assert body["role"] == "creator"
    assert body["email"] == email

    # Single-use: same code cannot reset again.
    reuse = client.post(
        "/api/auth/password/reset",
        json={"email": email, "token": "000000", "password": "AnotherPass99"},
    )
    assert reuse.status_code == 401

    assert (
        client.post(
            "/api/auth/login",
            json={"email": email, "password": old_password, "role": "creator"},
        ).status_code
        == 401
    )
    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": new_password, "role": "creator"},
    )
    assert login.status_code == 200, login.text
    assert login.json()["accessToken"]


def test_password_otp_expires_after_60s(client, monkeypatch) -> None:
    from datetime import UTC, datetime, timedelta

    from app.db.models import PendingPasswordReset
    from app.modules.identity import service as identity

    email = "reset.expire@example.com"
    assert (
        client.post(
            "/api/auth/signup",
            json={
                "email": email,
                "password": "Password12",
                "role": "creator",
                "displayName": "Expire",
            },
        ).status_code
        == 200
    )
    assert client.post("/api/auth/password/forgot", json={"email": email}).status_code == 200

    db = session_factory()()
    try:
        row = db.query(PendingPasswordReset).filter(PendingPasswordReset.email == email).one()
        row.expires_at = (datetime.now(UTC) - timedelta(seconds=1)).isoformat()
        db.commit()
    finally:
        db.close()

    response = client.post(
        "/api/auth/password/reset",
        json={"email": email, "token": "123456", "password": "NewPassword99"},
    )
    assert response.status_code == 410
    assert "expired" in response.json()["detail"].lower()
    assert identity.OTP_TTL_SECONDS == 60


def test_signup_otp_single_use_and_ttl(client) -> None:
    from datetime import UTC, datetime, timedelta

    from app.db.models import PendingSignup

    start = client.post(
        "/api/auth/signup/start",
        json={
            "email": "otp.once@example.com",
            "password": "Password12",
            "role": "creator",
            "displayName": "Once",
        },
    )
    assert start.status_code == 200, start.text
    assert start.json()["expiresIn"] == 60

    db = session_factory()()
    try:
        pending = db.query(PendingSignup).filter(PendingSignup.email == "otp.once@example.com").one()
        payload = dict(pending.payload or {})
        payload["otp_consumed"] = True
        pending.payload = payload
        db.commit()
    finally:
        db.close()

    used = client.post(
        "/api/auth/signup/verify",
        json={"email": "otp.once@example.com", "token": "123456", "role": "creator"},
    )
    assert used.status_code == 401
    assert "already used" in used.json()["detail"].lower()

    # Fresh code after resend.
    resend = client.post(
        "/api/auth/signup/resend",
        json={"email": "otp.once@example.com", "role": "creator"},
    )
    assert resend.status_code == 200, resend.text
    assert resend.json()["expiresIn"] == 60

    expire_start = client.post(
        "/api/auth/signup/start",
        json={
            "email": "otp.expire@example.com",
            "password": "Password12",
            "role": "creator",
            "displayName": "Expire",
        },
    )
    assert expire_start.status_code == 200

    db = session_factory()()
    try:
        pending = db.query(PendingSignup).filter(PendingSignup.email == "otp.expire@example.com").one()
        payload = dict(pending.payload or {})
        payload["otp_expires_at"] = (datetime.now(UTC) - timedelta(seconds=1)).isoformat()
        pending.payload = payload
        db.commit()
    finally:
        db.close()

    expired = client.post(
        "/api/auth/signup/verify",
        json={"email": "otp.expire@example.com", "token": "123456", "role": "creator"},
    )
    assert expired.status_code == 410
    assert "expired" in expired.json()["detail"].lower()


def test_password_reset_weak_password_rejected(client) -> None:
    email = "reset.weak@example.com"
    assert (
        client.post(
            "/api/auth/signup",
            json={
                "email": email,
                "password": "Password12",
                "role": "creator",
                "displayName": "Weak Reset",
            },
        ).status_code
        == 200
    )
    response = client.post(
        "/api/auth/password/reset",
        json={"email": email, "token": "123456", "password": "short"},
    )
    assert response.status_code == 422


def test_password_reset_supabase_path(client, monkeypatch) -> None:
    from app.core.config import get_settings
    from app.core.ids import new_id
    from app.core.passwords import hash_password

    settings = get_settings()
    monkeypatch.setattr(settings, "supabase_url", "https://example.supabase.co")
    monkeypatch.setattr(settings, "supabase_service_role_key", "test-service-role")
    monkeypatch.setattr(settings, "supabase_anon_key", "test-anon-key")
    monkeypatch.setattr(settings, "auth_email_otp_bypass", False)

    email = "reset.supa@example.com"
    user_id = "22222222-2222-2222-2222-222222222222"
    db = session_factory()()
    try:
        db.add(
            Profile(
                id=new_id("profile"),
                email=email,
                role="creator",
                display_name="Supa Reset",
                password_hash=hash_password("Password12"),
            )
        )
        db.commit()
    finally:
        db.close()

    calls: list[str] = []

    def fake_post(url, **kwargs):
        response = MagicMock()
        response.text = ""
        path = str(url)
        calls.append(f"POST {path}")
        if path.endswith("/auth/v1/recover"):
            response.status_code = 200
            response.json.return_value = {}
            return response
        if path.endswith("/auth/v1/resend"):
            response.status_code = 200
            response.json.return_value = {}
            return response
        if path.endswith("/auth/v1/verify"):
            assert kwargs.get("json", {}).get("type") == "recovery"
            response.status_code = 200
            response.json.return_value = {
                "access_token": "recovery-access-token",
                "user": {"id": user_id, "app_metadata": {"role": "creator"}},
            }
            return response
        response.status_code = 400
        response.json.return_value = {"msg": "unexpected"}
        return response

    def fake_put(url, **kwargs):
        response = MagicMock()
        response.text = ""
        path = str(url)
        calls.append(f"PUT {path}")
        assert path.endswith("/auth/v1/user")
        assert kwargs.get("json", {}).get("password") == "NewPassword99"
        assert kwargs.get("headers", {}).get("Authorization") == "Bearer recovery-access-token"
        response.status_code = 200
        response.json.return_value = {"id": user_id}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    monkeypatch.setattr(httpx, "put", fake_put)

    forgot = client.post("/api/auth/password/forgot", json={"email": email})
    assert forgot.status_code == 200, forgot.text
    assert forgot.json()["ok"] is True

    resend = client.post("/api/auth/password/resend", json={"email": email})
    assert resend.status_code == 200, resend.text

    reset = client.post(
        "/api/auth/password/reset",
        json={"email": email, "token": "424242", "password": "NewPassword99"},
    )
    assert reset.status_code == 200, reset.text
    body = reset.json()
    assert body["accessToken"]
    assert body["role"] == "creator"
    assert any("recover" in c for c in calls)
    assert any("verify" in c for c in calls)
    assert any(c.startswith("PUT ") and c.endswith("/auth/v1/user") for c in calls)