"""Dev seed aligned with src/lib/api/fixtures.ts and src/lib/portalSeeds.ts."""

from sqlalchemy.orm import Session

from app.db.models import (
    Assignment,
    Brand,
    BrandCollection,
    BrandInvoice,
    BrandPost,
    Campaign,
    Creator,
    CreatorApplication,
    CreatorEarning,
    Payout,
    Profile,
    Submission,
)

PRIMUS_BRIEF = (
    'Record a 20–60 sec reaction video to Primus Beer\'s new "Celebrate Rwanda" can design. '
    "Show the can, speak naturally in Kinyarwanda or French. Include the hashtag #PrimusRwanda.\n\n"
    "Requirements: Must be posted publicly on TikTok or Instagram Reels. "
    "Send us the post URL within 48 hours of posting."
)


def seed(db: Session) -> None:
    db.add_all(
        [
            Brand(
                id="br_primus",
                name="Primus Beer",
                legal_name="Primus Beer (Bralirwa)",
                company_line="Bralirwa Ltd.",
            ),
            Brand(
                id="br_iwacu",
                name="Iwacu Music",
                legal_name="Iwacu Music",
                company_line="Iwacu Music",
            ),
            Brand(
                id="br_kcb",
                name="KCB Rwanda",
                legal_name="KCB Rwanda",
                company_line="KCB Rwanda",
            ),
        ]
    )
    db.add_all(
        [
            Creator(
                id="cr_marie",
                display_name="Marie K.",
                tiktok_handle="@mariekigali",
                instagram_handle="@mariekigali",
                tiktok_followers=28_000,
                instagram_followers=9_000,
                niche="Lifestyle",
                momo="+250 788 222 333",
                label="Reliable",
                campaigns_completed=4,
            ),
            Creator(
                id="cr_jb",
                display_name="Jean-Baptiste N.",
                tiktok_handle="@jbntwali",
                instagram_handle="@jbntwali",
                tiktok_followers=12_000,
                instagram_followers=4_000,
                niche="Short-form",
                momo="+250 788 000 111",
                label="New",
                campaigns_completed=2,
            ),
            Creator(
                id="cr_amina",
                display_name="Amina G.",
                tiktok_handle="@aminacreates",
                instagram_handle="@aminacreates",
                tiktok_followers=6_000,
                instagram_followers=9_000,
                niche="Fashion stills",
                momo="+250 788 000 222",
                label="New",
                campaigns_completed=1,
            ),
        ]
    )
    db.add_all(
        [
            Profile(
                id="profile_admin",
                email="admin@ubunifu.dev",
                role="admin",
                display_name="Admin",
            ),
            Profile(
                id="profile_brand",
                email="brand@ubunifu.dev",
                role="brand",
                display_name="Brand",
                brand_id="br_primus",
            ),
            Profile(
                id="profile_creator",
                email="creator@ubunifu.dev",
                role="creator",
                display_name="Creator",
                creator_id="cr_marie",
            ),
        ]
    )
    db.add_all(
        [
            Campaign(
                id="cmp_primus",
                brand_id="br_primus",
                title="Primus Beer — reaction videos",
                brand_portal_title="Campaign #2 — Reaction videos",
                status="active",
                budget_rwf=600_000,
                created_at="2026-05-01T10:00:00.000Z",
                campaign_type="UGC reaction",
                deadline="2026-06-03",
                fee_percent=20,
                assigned_creators=8,
                submissions_received=5,
                submissions_approved=3,
                content_kind="ugc",
                setup_fee_rwf=50_000,
                platform_fee_rwf=120_000,
                creator_pool_rwf=430_000,
                pool_remaining_rwf=430_000,
                rpm_rwf=1_500,
                min_views=1_000,
                min_payout_rwf=0,
                max_payout_rwf=45_000,
                payout_due_at="2026-06-08",
                brief=PRIMUS_BRIEF,
                assignment_mode="open",
                funded_at="2026-05-01T10:00:00.000Z",
                run_period="June 1–15, 2026",
                fee_rwf=120_000,
                engagement_rate="4.8%",
                spend_rwf=135_000,
                total_views=52_900,
                spots_left=0,
                is_open=False,
                flat_payout_rwf=45_000,
                listed_in_admin=True,
                listed_in_discover=True,
                listed_in_brand=True,
            ),
            Campaign(
                id="cmp_iwacu",
                brand_id="br_iwacu",
                title="Iwacu Music — song clip campaign",
                status="active",
                budget_rwf=400_000,
                created_at="2026-05-10T14:00:00.000Z",
                campaign_type="Clipping (CPM)",
                deadline="2026-06-08",
                fee_percent=20,
                assigned_creators=5,
                submissions_received=2,
                submissions_approved=2,
                content_kind="clipping",
                setup_fee_rwf=50_000,
                platform_fee_rwf=80_000,
                creator_pool_rwf=270_000,
                pool_remaining_rwf=270_000,
                rpm_rwf=1_500,
                min_views=0,
                max_payout_rwf=40_000,
                brief="Clip campaign for Iwacu Music.",
                assignment_mode="invite",
                funded_at="2026-05-10T14:00:00.000Z",
                fee_rwf=80_000,
                engagement_rate="0%",
                spend_rwf=0,
                spots_left=0,
                is_open=False,
                listed_in_admin=True,
                listed_in_discover=False,
                listed_in_brand=False,
            ),
            Campaign(
                id="cmp_kcb",
                brand_id="br_kcb",
                title="KCB Rwanda — product review",
                status="draft",
                budget_rwf=800_000,
                created_at="2026-05-15T09:00:00.000Z",
                campaign_type="Product review",
                deadline="2026-06-20",
                fee_percent=20,
                assigned_creators=0,
                submissions_received=0,
                submissions_approved=0,
                content_kind="ugc",
                setup_fee_rwf=50_000,
                platform_fee_rwf=160_000,
                creator_pool_rwf=590_000,
                pool_remaining_rwf=590_000,
                rpm_rwf=1_500,
                brief=(
                    "Review the KCB mobile banking app in a 60–90 sec TikTok or Reel. "
                    "Show one feature you use weekly (transfers, savings, or bill pay). "
                    "Speak in Kinyarwanda, French, or English. Tag @KCBRwanda."
                ),
                assignment_mode="open",
                run_period="",
                fee_rwf=160_000,
                spots_left=12,
                is_open=True,
                flat_payout_rwf=55_000,
                listed_in_admin=True,
                listed_in_discover=True,
                listed_in_brand=False,
            ),
            Campaign(
                id="cmp_iwacu_open",
                brand_id="br_iwacu",
                title="Iwacu Music — interview clips (CPM)",
                status="active",
                budget_rwf=300_000,
                created_at="2026-05-12T09:00:00.000Z",
                campaign_type="Clipping (CPM)",
                deadline="2026-06-08",
                fee_percent=20,
                content_kind="clipping",
                setup_fee_rwf=30_000,
                platform_fee_rwf=60_000,
                creator_pool_rwf=210_000,
                pool_remaining_rwf=210_000,
                rpm_rwf=120,
                brief=(
                    "Clip the best 45–90 sec moment from Iwacu artist interviews. "
                    "Strong hook in the first 2 seconds. Post on TikTok or Reels with #IwacuMusic."
                ),
                assignment_mode="open",
                funded_at="2026-05-12T09:00:00.000Z",
                fee_rwf=60_000,
                spots_left=3,
                is_open=True,
                listed_in_admin=False,
                listed_in_discover=True,
                listed_in_brand=False,
            ),
            Campaign(
                id="cmp_primus_archive",
                brand_id="br_primus",
                title="Primus Beer — Summer launch stills",
                brand_portal_title="Campaign #1 — Summer launch stills",
                status="completed",
                budget_rwf=350_000,
                created_at="2026-04-01T09:00:00.000Z",
                campaign_type="Photo UGC",
                deadline="2026-04-30",
                fee_percent=20,
                assigned_creators=6,
                submissions_received=6,
                submissions_approved=6,
                content_kind="ugc",
                setup_fee_rwf=30_000,
                platform_fee_rwf=70_000,
                creator_pool_rwf=250_000,
                pool_remaining_rwf=0,
                rpm_rwf=1_500,
                brief="Share three still photos featuring Primus at outdoor gatherings.",
                assignment_mode="invite",
                funded_at="2026-04-01T09:00:00.000Z",
                run_period="April 10–30, 2026",
                fee_rwf=70_000,
                engagement_rate="3.2%",
                spend_rwf=350_000,
                total_views=91_000,
                spots_left=0,
                is_open=False,
                listed_in_admin=False,
                listed_in_discover=False,
                listed_in_brand=True,
            ),
        ]
    )
    db.add_all(
        [
            CreatorApplication(
                id="app_ruth",
                full_name="Ruth Nkusi",
                tiktok_handle="@ruthnkusi_rw",
                instagram_handle="@ruthnkusi_rw",
                tiktok_followers=41_000,
                instagram_followers=8_000,
                niche="Lifestyle",
                momo_phone="+250 788 100 001",
                status="pending",
                created_at="2026-05-18T08:00:00.000Z",
            ),
            CreatorApplication(
                id="app_david",
                full_name="David Olivier",
                tiktok_handle="@davidolivier",
                instagram_handle="@davidolivier",
                tiktok_followers=6_000,
                instagram_followers=3_000,
                niche="Comedy",
                momo_phone="+250 788 100 002",
                status="pending",
                created_at="2026-05-18T09:00:00.000Z",
            ),
        ]
    )
    db.add_all(
        [
            Assignment(
                id="asgn_primus",
                campaign_id="cmp_primus",
                creator_id="cr_marie",
                title="Primus Beer — Reaction videos",
                brief=(
                    "20–60 sec reaction to the new can design. Use #PrimusRwanda. "
                    "Post on TikTok or Reels and submit the URL within 48 hours."
                ),
                payout_rwf=45_000,
                deadline="June 3, 2026",
                post_url="https://tiktok.com/@mariekigali/video/123",
                status="approved",
            ),
            Assignment(
                id="asgn_iwacu",
                campaign_id="cmp_iwacu",
                creator_id="cr_marie",
                title="Iwacu Music — Clip this interview",
                brief=(
                    "Edit a 45–90 sec clip from the 20-min interview. "
                    "Best moment, good hook. Post on TikTok or Reels."
                ),
                source_url="https://drive.google.com/file/d/iwacu-interview",
                payout_rwf=28_000,
                deadline="June 8, 2026",
                status="not_submitted",
            ),
        ]
    )
    db.add_all(
        [
            Submission(
                id="sub_marie",
                campaign_id="cmp_primus",
                creator_id="cr_marie",
                assignment_id="asgn_primus",
                status="approved",
                post_url="https://tiktok.com/@mariekigali/video/123",
                submitted_at="2026-05-20T10:00:00.000Z",
                views=34_200,
            ),
            Submission(
                id="sub_jb",
                campaign_id="cmp_primus",
                creator_id="cr_jb",
                status="pending",
                submitted_at="2026-05-22T14:00:00.000Z",
            ),
            Submission(
                id="sub_amina",
                campaign_id="cmp_primus",
                creator_id="cr_amina",
                status="revision",
                revision_note="Add clearer product shot in the first 3 seconds.",
                submitted_at="2026-05-21T09:00:00.000Z",
            ),
        ]
    )
    db.add_all(
        [
            BrandPost(
                id="bp_marie",
                campaign_id="cmp_primus",
                submission_id="sub_marie",
                creator_name="Marie K.",
                handle="@mariekigali",
                platform="TikTok",
                followers_label="28K followers",
                post_url="https://tiktok.com/@mariekigali/video/123",
                views=34_200,
                status="approved",
            ),
            BrandPost(
                id="bp_jb",
                campaign_id="cmp_primus",
                submission_id="sub_jb",
                creator_name="Jean-Baptiste N.",
                handle="@jbntwali",
                platform="TikTok",
                followers_label="12K followers",
                post_url="https://tiktok.com/@jbntwali/video/456",
                views=18_700,
                status="approved",
            ),
            BrandPost(
                id="bp_amina",
                campaign_id="cmp_primus",
                submission_id="sub_amina",
                creator_name="Amina G.",
                handle="@aminacreates",
                platform="Instagram",
                followers_label="9K followers",
                status="pending",
            ),
        ]
    )
    db.add_all(
        [
            Payout(
                id="pay_marie",
                creator_id="cr_marie",
                campaign_id="cmp_primus",
                submission_id="sub_marie",
                creator_name="Marie K.",
                handle="@mariekigali",
                campaign_title="Primus Beer — reaction videos",
                amount_rwf=45_000,
                status="pending",
                views_at_snapshot=34_200,
            ),
            Payout(
                id="pay_jb",
                creator_id="cr_jb",
                campaign_id="cmp_primus",
                submission_id="sub_jb",
                creator_name="Jean-Baptiste N.",
                handle="@jbntwali",
                campaign_title="Primus Beer — reaction videos",
                amount_rwf=32_000,
                status="pending",
            ),
            Payout(
                id="pay_amina",
                creator_id="cr_amina",
                campaign_id="cmp_primus",
                submission_id="sub_amina",
                creator_name="Amina G.",
                handle="@aminacreates",
                campaign_title="Primus Beer — reaction videos",
                amount_rwf=28_000,
                status="pending",
            ),
            Payout(
                id="pay_others",
                creator_name="5 other creators",
                handle="—",
                campaign_title="Multiple campaigns",
                amount_rwf=79_000,
                status="pending",
            ),
        ]
    )
    db.add_all(
        [
            CreatorEarning(
                id="earn_primus",
                creator_id="cr_marie",
                campaign_title="Primus Beer — Reaction videos",
                amount_rwf=45_000,
                status="approved",
                payout_date="2026-05-30",
                payout_id="pay_marie",
            ),
            CreatorEarning(
                id="earn_iwacu",
                creator_id="cr_marie",
                campaign_title="Iwacu Music — Clip this interview",
                amount_rwf=28_000,
                status="pending",
            ),
            CreatorEarning(
                id="earn_archive",
                creator_id="cr_marie",
                campaign_title="Primus Beer — Summer launch stills",
                amount_rwf=38_000,
                status="paid",
                payout_date="2026-04-28",
            ),
        ]
    )
    db.add_all(
        [
            BrandCollection(
                id="col_primus",
                brand_id="br_primus",
                campaign_id="cmp_primus",
                label="Primus Beer — Campaign #2",
                amount_rwf=720_000,
                status="paid",
            ),
            BrandCollection(
                id="col_iwacu",
                brand_id="br_iwacu",
                campaign_id="cmp_iwacu",
                label="Iwacu Music — Song clip",
                amount_rwf=400_000,
                status="paid",
            ),
            BrandCollection(
                id="col_kcb",
                brand_id="br_kcb",
                campaign_id="cmp_kcb",
                label="KCB Rwanda — Product review",
                amount_rwf=960_000,
                status="pending",
            ),
        ]
    )
    db.add_all(
        [
            BrandInvoice(
                id="inv_primus_2",
                brand_id="br_primus",
                campaign_id="cmp_primus",
                label="Campaign #2 — Reaction videos",
                creator_budget_rwf=600_000,
                fee_rwf=120_000,
                setup_fee_rwf=0,
                total_rwf=720_000,
                status="paid",
            ),
            BrandInvoice(
                id="inv_primus_1",
                brand_id="br_primus",
                campaign_id="cmp_primus_archive",
                label="Campaign #1 — Summer launch stills",
                creator_budget_rwf=350_000,
                fee_rwf=70_000,
                setup_fee_rwf=0,
                total_rwf=420_000,
                status="paid",
            ),
        ]
    )
