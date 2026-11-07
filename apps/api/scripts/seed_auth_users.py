"""Create demo Supabase Auth users and remap public.profiles.id to auth.users.id."""

from __future__ import annotations

import json
from pathlib import Path

import httpx

ROOT = Path(__file__).resolve().parents[1]
ENV_PATH = ROOT / ".env"
PASSWORD = "CreatorsDemo1!"
DEMO = [
    ("admin@ubunifu.dev", "admin", "Admin"),
    ("brand@ubunifu.dev", "brand", "Brand"),
    ("creator@ubunifu.dev", "creator", "Creator"),
]
KEEP_EMAILS = {email for email, _, _ in DEMO}


def load_env() -> dict[str, str]:
    env: dict[str, str] = {}
    for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key] = value
    return env


def main() -> None:
    env = load_env()
    base = env["SUPABASE_URL"].rstrip("/")
    service = env["SUPABASE_SERVICE_ROLE_KEY"]
    anon = env["SUPABASE_ANON_KEY"]
    headers = {
        "apikey": service,
        "Authorization": f"Bearer {service}",
        "Content-Type": "application/json",
    }

    response = httpx.get(
        f"{base}/auth/v1/admin/users",
        headers=headers,
        params={"page": 1, "per_page": 200},
        timeout=30,
    )
    response.raise_for_status()
    users = response.json().get("users") or []
    by_email = {str(user.get("email", "")).lower(): user for user in users if user.get("email")}
    print("existing auth users:", sorted(by_email))

    created: dict[str, str] = {}
    for email, role, name in DEMO:
        if email in by_email:
            user_id = by_email[email]["id"]
            update = httpx.put(
                f"{base}/auth/v1/admin/users/{user_id}",
                headers=headers,
                json={
                    "password": PASSWORD,
                    "email_confirm": True,
                    "app_metadata": {"role": role},
                    "user_metadata": {"display_name": name},
                },
                timeout=30,
            )
            print("update", email, update.status_code)
            update.raise_for_status()
            created[email] = user_id
        else:
            create = httpx.post(
                f"{base}/auth/v1/admin/users",
                headers=headers,
                json={
                    "email": email,
                    "password": PASSWORD,
                    "email_confirm": True,
                    "app_metadata": {"role": role},
                    "user_metadata": {"display_name": name},
                },
                timeout=30,
            )
            print("create", email, create.status_code, create.text[:200])
            create.raise_for_status()
            created[email] = create.json()["id"]

    print("auth ids:", json.dumps(created, indent=2))

    auth_login = {
        "apikey": anon,
        "Authorization": f"Bearer {anon}",
        "Content-Type": "application/json",
    }
    for email, _, _ in DEMO:
        token = httpx.post(
            f"{base}/auth/v1/token",
            headers=auth_login,
            params={"grant_type": "password"},
            json={"email": email, "password": PASSWORD},
            timeout=30,
        )
        print("login", email, token.status_code)

    out = ROOT / "scripts" / ".demo_auth_ids.json"
    out.write_text(json.dumps(created, indent=2), encoding="utf-8")
    print("wrote", out)


if __name__ == "__main__":
    main()
