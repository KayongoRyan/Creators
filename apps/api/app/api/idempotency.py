import json

from sqlalchemy.orm import Session

from app.db.models import IdempotencyKey


def run_idempotent(db: Session, key: str | None, scope: str, producer):
    if key:
        existing = db.get(IdempotencyKey, f"{scope}:{key}")
        if existing is not None:
            return json.loads(existing.response_json)
    result = producer()
    if key:
        db.add(IdempotencyKey(id=f"{scope}:{key}", response_json=json.dumps(result)))
    return result
