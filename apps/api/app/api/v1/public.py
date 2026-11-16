from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.modules.creators.service import submit_public_application

router = APIRouter(prefix="/public", tags=["public"])


@router.post("/creator-applications")
async def post_creator_application(
    fullName: str = Form(),
    momo: str = Form(""),
    tiktokHandle: str = Form(""),
    instagramHandle: str = Form(""),
    niche: str = Form("Lifestyle"),
    whyJoin: str = Form(""),
    email: str = Form(""),
    tiktokFollowers: int = Form(0),
    instagramFollowers: int = Form(0),
    screenshot: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
) -> dict:
    screenshot_bytes = b""
    screenshot_name = None
    screenshot_type = None
    if screenshot is not None:
        screenshot_bytes = await screenshot.read()
        screenshot_name = screenshot.filename
        screenshot_type = screenshot.content_type
    return submit_public_application(
        db,
        full_name=fullName,
        momo_phone=momo,
        tiktok_handle=tiktokHandle,
        instagram_handle=instagramHandle,
        niche=niche,
        why_join=whyJoin,
        screenshot_bytes=screenshot_bytes or None,
        screenshot_name=screenshot_name,
        screenshot_type=screenshot_type,
        email=email or None,
        tiktok_followers=tiktokFollowers,
        instagram_followers=instagramFollowers,
    )
