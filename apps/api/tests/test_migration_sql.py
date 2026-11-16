from app.core.config import REPO_ROOT

MIGRATION = REPO_ROOT / "supabase" / "migrations" / "20261106000000_init.sql"

TABLES = (
    "profiles",
    "creators",
    "brands",
    "creator_applications",
    "campaigns",
    "campaign_applications",
    "assignments",
    "submissions",
    "payouts",
    "creator_earnings",
    "brand_invoices",
    "brand_collections",
    "admin_events",
    "idempotency_keys",
)


def test_migration_declares_tables_indexes_and_rls() -> None:
    sql = MIGRATION.read_text(encoding="utf-8").lower()
    for table in TABLES:
        assert f"create table if not exists {table}" in sql
        assert f"alter table {table} enable row level security" in sql
    assert "create index if not exists submissions_status_idx" in sql
    assert "create index if not exists payouts_status_idx" in sql
    assert "auth.uid()" in sql
