"""Print which SQL migrations are present and whether schema_migrations has them."""

from __future__ import annotations

from sqlalchemy import text

from app.core.config import get_settings
from app.core.db import get_engine
from app.db.apply import ordered_migrations


def main() -> None:
    paths = ordered_migrations()
    print(f"DATABASE_URL dialect target: {get_settings().resolved_database_url.split('://')[0]}")
    print(f"Found {len(paths)} migration file(s):")
    for path in paths:
        print(f"  - {path.name}")

    url = get_settings().resolved_database_url
    if not url.startswith("postgres"):
        print("SQLite/ORM mode — migrations applied via create_all + column patches.")
        return

    engine = get_engine()
    with engine.connect() as connection:
        connection.execute(
            text(
                "create table if not exists schema_migrations ("
                " id text primary key, applied_at timestamptz not null default now())"
            )
        )
        connection.commit()
        rows = connection.execute(text("select id from schema_migrations order by id")).fetchall()
        applied = {row[0] for row in rows}
    print(f"Applied ({len(applied)}):")
    for name in sorted(applied):
        print(f"  - {name}")
    pending = [path.name for path in paths if path.name not in applied]
    print(f"Pending ({len(pending)}):")
    for name in pending:
        print(f"  - {name}")


if __name__ == "__main__":
    main()
