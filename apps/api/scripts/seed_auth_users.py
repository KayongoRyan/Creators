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

    database_url = env.get("DATABASE_URL", "").strip()
    if database_url:
        remap_profiles(database_url, created)
    else:
        print("DATABASE_URL unset — skip profile remap / orphan cleanup")


def remap_profiles(database_url: str, auth_ids: dict[str, str]) -> None:
    """Point demo profiles.id at auth.users.id and drop slug invent leftovers."""
    from sqlalchemy import create_engine, text

    engine = create_engine(database_url)
    with engine.begin() as conn:
        for email, auth_id in auth_ids.items():
            row = conn.execute(
                text(
                    "select id, role, brand_id, creator_id, display_name "
                    "from profiles where email = :email"
                ),
                {"email": email},
            ).mappings().first()
            if row is None:
                print("missing profile for", email)
                continue
            if row["id"] == auth_id:
                print("profile already mapped", email, auth_id)
                continue
            conn.execute(
                text(
                    "insert into profiles (id, email, role, display_name, brand_id, creator_id) "
                    "values (:id, :email, :role, :display_name, :brand_id, :creator_id) "
                    "on conflict (id) do update set "
                    "email = excluded.email, role = excluded.role, "
                    "display_name = excluded.display_name, "
                    "brand_id = excluded.brand_id, creator_id = excluded.creator_id"
                ),
                {
                    "id": auth_id,
                    "email": email,
                    "role": row["role"],
                    "display_name": row["display_name"],
                    "brand_id": row["brand_id"],
                    "creator_id": row["creator_id"],
                },
            )
            conn.execute(
                text("delete from profiles where id = :old_id"),
                {"old_id": row["id"]},
            )
            print("remapped", email, row["id"], "->", auth_id)

        orphans = conn.execute(
            text("select id, email from profiles where id like 'profile_%'")
        ).all()
        for profile_id, email in orphans:
            conn.execute(text("delete from profiles where id = :id"), {"id": profile_id})
            print("deleted orphan", email, profile_id)


if __name__ == "__main__":
    main()
