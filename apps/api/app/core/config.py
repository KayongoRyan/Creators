from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parents[2]
REPO_ROOT = API_ROOT.parent.parent


def _default_sqlite_url() -> str:
    path = API_ROOT / ".data" / "ugc.db"
    return "sqlite:///" + path.as_posix()


def _default_cors() -> str:
    hosts = ("localhost", "127.0.0.1", "172.22.192.1")
    ports = (3000, 3001, 3002, 3003, 4000)
    return ",".join(f"http://{host}:{port}" for host in hosts for port in ports)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(API_ROOT / ".env"),
        extra="ignore",
    )

    database_url: str = ""
    jwt_secret: str = "dev-only-change-me-please-32b"
    supabase_jwt_secret: str = ""
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_anon_key: str = ""
    auth_dev: bool = True
    upload_dir: str = ""
    cors_origins: str = ""

    @property
    def resolved_database_url(self) -> str:
        return self.database_url or _default_sqlite_url()

    @property
    def cors_origin_list(self) -> list[str]:
        raw = self.cors_origins or _default_cors()
        return [item.strip() for item in raw.split(",") if item.strip()]

    @property
    def upload_path(self) -> Path:
        raw = self.upload_dir or str(API_ROOT / "uploads")
        return Path(raw)


@lru_cache
def get_settings() -> Settings:
    return Settings()
