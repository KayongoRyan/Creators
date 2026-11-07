from unittest.mock import MagicMock

import httpx

from app.core.db import session_factory
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


def test_login_unknown_email_does_not_create_profile(client, monkeypatch) -> None:
    def fake_post(url, **kwargs):
        response = MagicMock()
        response.status_code = 400
        response.text = "Invalid login credentials"
        response.json.return_value = {"error": "invalid"}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    before = session_factory()()
    try:
        count_before = before.query(Profile).count()
    finally:
        before.close()

    response = client.post(
        "/api/auth/login",
        json={"email": "ghost@example.com", "password": "whatever12", "role": "creator"},
    )
    assert response.status_code == 401

    after = session_factory()()
    try:
        assert after.query(Profile).count() == count_before
        assert after.query(Profile).filter(Profile.email == "ghost@example.com").one_or_none() is None
    finally:
        after.close()


def test_login_wrong_password(client, monkeypatch) -> None:
    def fake_post(url, **kwargs):
        response = MagicMock()
        response.status_code = 400
        response.text = "Invalid login credentials"
        response.json.return_value = {"error": "invalid"}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    response = client.post(
        "/api/auth/login",
        json={
            "email": "creator@ubunifu.dev",
            "password": "wrong-password",
            "role": "creator",
        },
    )
    assert response.status_code == 401


def test_signup_then_login(client, monkeypatch) -> None:
    calls: list[str] = []

    def fake_post(url, **kwargs):
        calls.append(str(url))
        response = MagicMock()
        if "/admin/users" in str(url):
            response.status_code = 200
            response.text = ""
            response.json.return_value = {"id": "11111111-1111-1111-1111-111111111111"}
            return response
        response.status_code = 200
        response.text = ""
        response.json.return_value = {"access_token": "supabase-access-token"}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    signup = client.post(
        "/api/auth/signup",
        json={
            "email": "new.creator@example.com",
            "password": "password12",
            "role": "creator",
            "displayName": "New Creator",
        },
    )
    assert signup.status_code == 200, signup.text
    assert signup.json()["accessToken"] == "supabase-access-token"
    assert signup.json()["role"] == "creator"

    db = session_factory()()
    try:
        profile = db.query(Profile).filter(Profile.email == "new.creator@example.com").one()
        assert profile.id == "11111111-1111-1111-1111-111111111111"
        assert profile.creator_id
        assert profile.role == "creator"
    finally:
        db.close()

    login = client.post(
        "/api/auth/login",
        json={
            "email": "new.creator@example.com",
            "password": "password12",
            "role": "creator",
        },
    )
    assert login.status_code == 200
    assert login.json()["accessToken"] == "supabase-access-token"
    assert any("/admin/users" in call for call in calls)
    assert any("grant_type=password" in call or "/token" in call for call in calls)


def test_signup_rejects_existing_email(client) -> None:
    response = client.post(
        "/api/auth/signup",
        json={
            "email": "creator@ubunifu.dev",
            "password": "password12",
            "role": "creator",
            "displayName": "Marie",
        },
    )
    assert response.status_code == 409


def test_login_role_mismatch(client, monkeypatch) -> None:
    def fake_post(url, **kwargs):
        response = MagicMock()
        response.status_code = 200
        response.text = ""
        response.json.return_value = {"access_token": "supabase-access-token"}
        return response

    monkeypatch.setattr(httpx, "post", fake_post)
    response = client.post(
        "/api/auth/login",
        json={
            "email": "creator@ubunifu.dev",
            "password": "CreatorsDemo1!",
            "role": "admin",
        },
    )
    assert response.status_code == 401
