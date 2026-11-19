"""Apply the schema. Postgres runs ordered SQL migrations; sqlite uses the ORM."""

from pathlib import Path

from sqlalchemy import text

from app.core.config import REPO_ROOT, get_settings
from app.core.db import get_engine
from app.db.base import Base

MIGRATIONS_DIR = REPO_ROOT / "supabase" / "migrations"


def ordered_migrations() -> list[Path]:
    paths = sorted(MIGRATIONS_DIR.glob("*.sql"))
    # Screenshots bucket needs storage schema; apply after core tables.
    core = [p for p in paths if not p.name.endswith("_creator_screenshots_bucket.sql")]
    bucket = [p for p in paths if p.name.endswith("_creator_screenshots_bucket.sql")]
    return core + bucket


def apply_schema() -> None:
    url = get_settings().resolved_database_url
    if url.startswith("postgres"):
        for path in ordered_migrations():
            apply_sql_migration(url, path)
        return
    if url.startswith("sqlite:///") and ":memory:" not in url:
        Path(url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
    import app.db.models  # noqa: F401

    engine = get_engine()
    Base.metadata.create_all(engine)
    _ensure_sqlite_columns(engine)


def _ensure_sqlite_columns(engine) -> None:
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as connection:
        profile_cols = {row[1] for row in connection.execute(text("pragma table_info(profiles)")).fetchall()}
        if "password_hash" not in profile_cols:
            connection.execute(text("alter table profiles add column password_hash text"))

        creator_cols = {row[1] for row in connection.execute(text("pragma table_info(creators)")).fetchall()}
        if "phone" not in creator_cols and "momo" in creator_cols:
            connection.execute(text("alter table creators add column phone text not null default ''"))
            connection.execute(text("update creators set phone = momo where phone = ''"))
        elif "phone" not in creator_cols:
            connection.execute(text("alter table creators add column phone text not null default ''"))

        app_cols = {
            row[1]
            for row in connection.execute(text("pragma table_info(creator_applications)")).fetchall()
        }
        if "phone" not in app_cols and "momo_phone" in app_cols:
            connection.execute(
                text("alter table creator_applications add column phone text not null default ''")
            )
            connection.execute(
                text("update creator_applications set phone = momo_phone where phone = ''")
            )
        elif "phone" not in app_cols:
            connection.execute(
                text("alter table creator_applications add column phone text not null default ''")
            )

        brand_cols = {row[1] for row in connection.execute(text("pragma table_info(brands)")).fetchall()}
        # brands may not have momo; BrandAccount.momoPhone is FE-only historically
        _ = brand_cols

        campaign_cols = {
            row[1] for row in connection.execute(text("pragma table_info(campaigns)")).fetchall()
        }
        if "source_asset_path" not in campaign_cols:
            connection.execute(text("alter table campaigns add column source_asset_path text"))


def main() -> None:
    from app.core.db import session_factory
    from app.db.models import Campaign
    from app.db.seed import ensure_demo_passwords, seed

    apply_schema()
    db = session_factory()()
    try:
        if get_settings().seed_demo and db.query(Campaign).count() == 0:
            seed(db)
        ensure_demo_passwords(db)
        db.commit()
    finally:
        db.close()


def _sql_statements(script: str) -> list[str]:
    """Split migration SQL on ';', ignoring whole-line '--' comments (semicolons in comments break naïve split)."""
    without_line_comments = "\n".join(
        line for line in script.splitlines() if not line.strip().startswith("--")
    )
    return [chunk.strip() for chunk in without_line_comments.split(";") if chunk.strip()]


def apply_sql_migration(database_url: str, path: Path) -> None:
    import psycopg

    database_url = database_url.replace("postgresql+psycopg://", "postgresql://", 1)
    script = path.read_text(encoding="utf-8")
    statements = _sql_statements(script)
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "create table if not exists schema_migrations ("
                " id text primary key,"
                " applied_at timestamptz not null default now())"
            )
            cursor.execute(
                "select 1 from schema_migrations where id = %s",
                (path.name,),
            )
            if cursor.fetchone():
                connection.commit()
                return
            for statement in statements:
                cursor.execute(statement)
            cursor.execute(
                "insert into schema_migrations (id) values (%s) on conflict do nothing",
                (path.name,),
            )
        connection.commit()


if __name__ == "__main__":
    main()
