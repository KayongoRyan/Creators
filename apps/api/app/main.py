from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import get_settings
from app.core.security import warmup_supabase_jwks
from app.core.db import session_factory
from app.db.apply import apply_schema
from app.db.models import Campaign
from app.db.seed import seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    apply_schema()
    warmup_supabase_jwks()
    db: Session = session_factory()()
    try:
        from app.db.seed import ensure_demo_passwords, seed

        if get_settings().seed_demo and db.query(Campaign).count() == 0:
            seed(db)
        ensure_demo_passwords(db)
        db.commit()
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="UGC Rwanda API", version="0.1.0", lifespan=lifespan)
    # AUTH_DEV: also allow any localhost/private-LAN origin so Hyper-V IPs
    # (172.x that change) don't 400 OPTIONS preflight to /api/auth/*.
    cors_kwargs: dict = {
        "allow_origins": settings.cors_origin_list,
        "allow_credentials": True,
        "allow_methods": ["*"],
        "allow_headers": ["*"],
    }
    if settings.auth_dev:
        cors_kwargs["allow_origin_regex"] = (
            r"https?://("
            r"localhost|127\.0\.0\.1|"
            r"192\.168\.\d{1,3}\.\d{1,3}|"
            r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}|"
            r"172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}"
            r")(:\d+)?"
        )
    app.add_middleware(CORSMiddleware, **cors_kwargs)
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
