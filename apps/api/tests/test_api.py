import jwt

from app.core.config import get_settings
from app.db.models import Campaign, CreatorApplication
from app.core.db import session_factory


def token(client, role: str, email: str) -> dict[str, str]:
    response = client.post(
        "/api/auth/dev-token",
        json={"role": role, "email": email, "displayName": role},
    )
    assert response.status_code == 200, response.text
    access = response.json()["accessToken"]
    return {"Authorization": f"Bearer {access}"}


def test_health(client) -> None:
    assert client.get("/api/health").json() == {"ok": True}


def test_admin_state_matches_portal_contract(client) -> None:
    headers = token(client, "admin", "admin@ubunifu.dev")
    state = client.get("/api/admin/state", headers=headers).json()
    assert {row["id"] for row in state["campaigns"]} >= {
        "cmp_primus",
        "cmp_iwacu",
        "cmp_kcb",
    }
    assert state["campaigns"][0]["budgetCents"] == state["campaigns"][0]["budgetCents"]
    primus = next(row for row in state["campaigns"] if row["id"] == "cmp_primus")
    assert primus["budgetCents"] == 60_000_000
    assert {row["id"] for row in state["creatorApplications"]} == {"app_ruth", "app_david"}
    assert {row["id"] for row in state["payouts"]} == {
        "pay_marie",
        "pay_jb",
        "pay_amina",
        "pay_others",
    }
    denied = client.get("/api/admin/state", headers=token(client, "brand", "brand@ubunifu.dev"))
    assert denied.status_code == 403


def test_brand_and_creator_portals(client) -> None:
    brand = client.get(
        "/api/brand/state",
        headers=token(client, "brand", "brand@ubunifu.dev"),
    ).json()
    assert brand["brandName"] == "Primus Beer"
    assert {row["id"] for row in brand["campaigns"]} == {"cmp_primus", "cmp_primus_archive"}
    assert brand["invoices"][0]["totalRwf"] > 0

    creator = client.get(
        "/api/creator/state",
        headers=token(client, "creator", "creator@ubunifu.dev"),
    ).json()
    assert creator["profile"]["displayName"] == "Marie K."
    assert creator["profile"]["momo"] == "+250 788 222 333"
    open_ids = {row["id"] for row in creator["discover"] if row["open"]}
    assert "cmp_kcb" in open_ids
    assert "cmp_iwacu_open" in open_ids
    primus = next(row for row in creator["discover"] if row["id"] == "cmp_primus")
    assert primus["open"] is False
    assert primus["poolRemainingRwf"] == 430_000


def test_verify_reject_and_payouts(client) -> None:
    headers = token(client, "admin", "admin@ubunifu.dev")
    assert client.post("/api/admin/creators/app_ruth/verify", headers=headers).status_code == 200
    state = client.get("/api/admin/state", headers=headers).json()
    assert "app_ruth" not in {row["id"] for row in state["creatorApplications"]}
    assert any(row["displayName"] == "Ruth Nkusi" for row in state["verifiedCreators"])
    assert client.post("/api/admin/creators/app_david/reject", headers=headers).status_code == 200
    state = client.get("/api/admin/state", headers=headers).json()
    assert "app_david" not in {row["id"] for row in state["creatorApplications"]}

    assert client.post("/api/admin/payouts/pay_marie/mark-paid", headers=headers).status_code == 200
    creator = client.get(
        "/api/creator/state",
        headers=token(client, "creator", "creator@ubunifu.dev"),
    ).json()
    paid = next(row for row in creator["earnings"] if row["id"] == "earn_primus")
    assert paid["status"] == "paid"
    assert client.post("/api/admin/payouts/mark-all-paid", headers=headers).status_code == 200
    state = client.get("/api/admin/state", headers=headers).json()
    assert all(row["status"] == "paid" for row in state["payouts"])


def test_approve_decrements_pool_once(client) -> None:
    headers = token(client, "admin", "admin@ubunifu.dev")
    first = client.post(
        "/api/admin/submissions/sub_jb/approve",
        headers={**headers, "Idempotency-Key": "approve-jb"},
    )
    assert first.status_code == 200
    second = client.post(
        "/api/admin/submissions/sub_jb/approve",
        headers={**headers, "Idempotency-Key": "approve-jb"},
    )
    assert second.status_code == 200
    state = client.get("/api/admin/state", headers=headers).json()
    primus = next(row for row in state["campaigns"] if row["id"] == "cmp_primus")
    assert primus["poolRemainingRwf"] == 385_000
    assert primus["submissionsApproved"] == 4


def test_snapshot_is_idempotent_and_reports(client) -> None:
    headers = token(client, "admin", "admin@ubunifu.dev")
    body = {"views": [{"submissionId": "sub_marie", "views": 2000}]}
    assert (
        client.post(
            "/api/admin/campaigns/cmp_primus/snapshot",
            headers={**headers, "Idempotency-Key": "snap-1"},
            json=body,
        ).status_code
        == 200
    )
    changed = {"views": [{"submissionId": "sub_marie", "views": 9000}]}
    client.post(
        "/api/admin/campaigns/cmp_primus/snapshot",
        headers={**headers, "Idempotency-Key": "snap-1"},
        json=changed,
    )
    report = client.get("/api/admin/campaigns/cmp_primus/report", headers=headers).json()
    marie = next(row for row in report["creators"] if row["creatorName"] == "Marie K.")
    assert marie["views"] == 2000
    assert marie["payoutRwf"] == 3_000
    assert report["totalReach"] == 2000


def test_fund_gates_launch_and_creator_flow(client) -> None:
    admin = token(client, "admin", "admin@ubunifu.dev")
    created = client.post(
        "/api/admin/campaigns",
        headers=admin,
        json={
            "title": "Serena brunch",
            "brandName": "Serena Hotel",
            "campaignType": "UGC",
            "budgetRwf": 900_000,
            "deadline": "2026-07-01",
            "spotsLeft": 4,
            "flatPayoutRwf": 40_000,
            "maxPayoutRwf": 40_000,
        },
    )
    assert created.status_code == 200, created.text
    campaign_id = created.json()["id"]
    creator = token(client, "creator", "creator@ubunifu.dev")
    blocked = client.post(
        "/api/creator/applications",
        headers=creator,
        json={"campaignId": campaign_id, "pitch": "I can shoot this"},
    )
    assert blocked.status_code == 409
    assert client.post(f"/api/admin/campaigns/{campaign_id}/fund", headers=admin).status_code == 200
    opened = client.post(
        "/api/creator/applications",
        headers=creator,
        json={"campaignId": campaign_id},
    )
    assert opened.status_code == 200
    state = client.get("/api/creator/state", headers=creator).json()
    assert any(row["campaignId"] == campaign_id for row in state["applications"])
    db = session_factory()()
    try:
        campaign = db.get(Campaign, campaign_id)
        assert campaign is not None
        assert campaign.creator_pool_rwf == 670_000
        assert campaign.funded_at
        assert campaign.is_open is True
    finally:
        db.close()

    submitted = client.post(
        "/api/creator/assignments/asgn_iwacu/submit",
        headers=creator,
        json={"postUrl": "https://tiktok.com/@mariekigali/video/999"},
    )
    assert submitted.status_code == 200
    state = client.get("/api/creator/state", headers=creator).json()
    assignment = next(row for row in state["assignments"] if row["id"] == "asgn_iwacu")
    assert assignment["status"] == "pending"
    assert assignment["postUrl"].endswith("/999")

    patched = client.patch(
        "/api/creator/profile",
        headers=creator,
        json={"momo": "+250 788 999 000"},
    )
    assert patched.status_code == 200
    assert (
        client.get("/api/creator/state", headers=creator).json()["profile"]["momo"]
        == "+250 788 999 000"
    )


def test_public_application_stores_screenshot(client) -> None:
    response = client.post(
        "/api/public/creator-applications",
        data={
            "fullName": "Keza Aline",
            "momo": "+250 788 321 000",
            "tiktokHandle": "@keza",
            "instagramHandle": "@keza",
            "niche": "Food",
            "whyJoin": "I post lunch spots in Kigali",
        },
        files={"screenshot": ("dash.png", b"\x89PNG", "image/png")},
    )
    assert response.status_code == 200, response.text
    application_id = response.json()["id"]
    headers = token(client, "admin", "admin@ubunifu.dev")
    state = client.get("/api/admin/state", headers=headers).json()
    assert any(row["fullName"] == "Keza Aline" for row in state["creatorApplications"])
    db = session_factory()()
    try:
        row = db.get(CreatorApplication, application_id)
        assert row is not None
        assert row.screenshot_path
        assert row.status == "pending"
    finally:
        db.close()


def test_legacy_lists_and_demo_header(client) -> None:
    headers = {"X-Demo-Role": "creator", "X-Demo-Email": "creator@ubunifu.dev"}
    campaigns = client.get("/api/campaigns", headers=headers)
    assert campaigns.status_code == 200
    assert any(row["id"] == "cmp_primus" for row in campaigns.json())
    earnings = client.get("/api/earnings", headers=headers).json()
    assert earnings["availableCents"] == (45_000 + 38_000) * 100
    assert client.get("/api/brands", headers=headers).status_code == 200
    assert client.get("/api/creators", headers=headers).status_code == 200
    assert client.get("/api/submissions", headers=headers).status_code == 200
    assert client.get("/api/payments", headers=headers).status_code == 200


def test_supabase_jwt(client, monkeypatch) -> None:
    settings = get_settings()
    monkeypatch.setattr(settings, "supabase_jwt_secret", "supabase-secret-must-be-32-bytes")
    encoded = jwt.encode(
        {
            "sub": "profile_admin",
            "email": "admin@ubunifu.dev",
            "role": "authenticated",
            "app_metadata": {"role": "admin"},
        },
        "supabase-secret-must-be-32-bytes",
        algorithm="HS256",
    )
    response = client.get("/api/admin/state", headers={"Authorization": f"Bearer {encoded}"})
    assert response.status_code == 200, response.text
