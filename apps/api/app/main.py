from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.api.router import api_router
from app.core.config import get_settings
from app.core.db import session_factory
from app.db.apply import apply_schema
from app.db.models import Campaign
from app.db.seed import seed


@asynccontextmanager
async def lifespan(_: FastAPI):
    apply_schema()
    db: Session = session_factory()()
    try:
        if db.query(Campaign).count() == 0:
            seed(db)
            db.commit()
    finally:
        db.close()
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="UGC Rwanda API", version="0.1.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
