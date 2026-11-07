from pathlib import Path

import httpx

from app.core.config import get_settings


def save_screenshot(application_id: str, filename: str, data: bytes, content_type: str) -> str:
    settings = get_settings()
    safe_name = Path(filename or "screenshot.png").name.replace(" ", "_")
    object_name = f"{application_id}-{safe_name}"
    if settings.supabase_url and settings.supabase_service_role_key:
        uploaded = _upload_supabase(object_name, data, content_type or "image/png")
        if uploaded:
            return uploaded
    folder = settings.upload_path
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / object_name
    path.write_bytes(data)
    return str(path)


def _upload_supabase(object_name: str, data: bytes, content_type: str) -> str | None:
    settings = get_settings()
    base = settings.supabase_url.rstrip("/")
    url = f"{base}/storage/v1/object/creator-screenshots/{object_name}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    try:
        response = httpx.post(url, content=data, headers=headers, timeout=20)
    except httpx.HTTPError:
        return None
    if response.status_code >= 300:
        return None
    return f"creator-screenshots/{object_name}"
