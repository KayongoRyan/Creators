from app.modules.campaigns.economics import (
    creator_pool_rwf,
    payout_from_views,
    setup_fee_rwf,
)


def test_setup_fee_matches_prd_examples() -> None:
    assert setup_fee_rwf(200_000) == 30_000
    assert setup_fee_rwf(250_000) == 30_000
    assert setup_fee_rwf(300_000) == 30_000
    assert setup_fee_rwf(600_000) == 50_000
    assert setup_fee_rwf(900_000) == 50_000
    assert setup_fee_rwf(1_000_000) == 80_000


def test_creator_pool_deducts_fee_and_setup() -> None:
    assert creator_pool_rwf(900_000, 20, 50_000) == 670_000


def test_payout_clamps_views_and_caps() -> None:
    assert (
        payout_from_views(
            views=500,
            rpm_rwf=1_500,
            min_views=1_000,
            min_payout_rwf=0,
            max_payout_rwf=45_000,
        )
        == 0
    )
    assert (
        payout_from_views(
            views=2_000,
            rpm_rwf=1_500,
            min_views=1_000,
            min_payout_rwf=0,
            max_payout_rwf=45_000,
        )
        == 3_000
    )
    assert (
        payout_from_views(
            views=80_000,
            rpm_rwf=1_500,
            min_views=0,
            min_payout_rwf=1_000,
            max_payout_rwf=45_000,
        )
        == 45_000
    )
