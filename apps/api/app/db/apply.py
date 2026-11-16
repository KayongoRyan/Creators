"""Apply the schema. Postgres runs the Supabase migration; sqlite uses the ORM."""

from pathlib import Path

from app.core.config import REPO_ROOT, get_settings
from app.core.db import get_engine
from app.db.base import Base

MIGRATION = REPO_ROOT / "supabase" / "migrations" / "20261106000000_init.sql"


def apply_schema() -> None:
    url = get_settings().resolved_database_url
    if url.startswith("postgres"):
        apply_sql_migration(url, MIGRATION)
        return
    if url.startswith("sqlite:///") and ":memory:" not in url:
        Path(url.removeprefix("sqlite:///")).parent.mkdir(parents=True, exist_ok=True)
    import app.db.models  # noqa: F401

    Base.metadata.create_all(get_engine())


def main() -> None:
    from app.core.db import session_factory
    from app.db.models import Campaign
    from app.db.seed import seed

    apply_schema()
    db = session_factory()()
    try:
        if db.query(Campaign).count() == 0:
            seed(db)
            db.commit()
    finally:
        db.close()


def apply_sql_migration(database_url: str, path: Path) -> None:
    import psycopg

    database_url = database_url.replace("postgresql+psycopg://", "postgresql://", 1)
    script = path.read_text(encoding="utf-8")
    statements = [chunk.strip() for chunk in script.split(";") if chunk.strip()]
    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            for statement in statements:
                cursor.execute(statement)
        connection.commit()


if __name__ == "__main__":
    main()
