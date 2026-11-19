from pathlib import Path

import httpx

from app.core.config import get_settings

BUCKET = "campaign-assets"


def save_campaign_source_asset(
    campaign_id: str,
    filename: str,
    data: bytes,
    content_type: str,
) -> str:
    settings = get_settings()
    safe_name = Path(filename or "source.bin").name.replace(" ", "_")
    object_name = f"{campaign_id}-{safe_name}"
    if settings.supabase_url and settings.supabase_service_role_key:
        uploaded = _upload_supabase(object_name, data, content_type or "application/octet-stream")
        if uploaded:
            return uploaded
    folder = settings.upload_path / "campaign-assets"
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / object_name
    path.write_bytes(data)
    return str(path)


def _upload_supabase(object_name: str, data: bytes, content_type: str) -> str | None:
    settings = get_settings()
    base = settings.supabase_url.rstrip("/")
    url = f"{base}/storage/v1/object/{BUCKET}/{object_name}"
    headers = {
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "apikey": settings.supabase_service_role_key,
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    try:
        response = httpx.post(url, content=data, headers=headers, timeout=60)
    except httpx.HTTPError:
        return None
    if response.status_code >= 300:
        return None
    return f"{BUCKET}/{object_name}"
