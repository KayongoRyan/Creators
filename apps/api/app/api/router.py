from fastapi import APIRouter

from app.api.v1 import admin, auth, brand, creator, legacy, public

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(brand.router)
api_router.include_router(creator.router)
api_router.include_router(public.router)
api_router.include_router(legacy.router)


@api_router.get("/health")
def health() -> dict:
    return {"ok": True}
