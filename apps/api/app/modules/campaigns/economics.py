"""PRD campaign money rules. Amounts are integer RWF."""


def setup_fee_rwf(total_budget_rwf: int) -> int:
    """Non-refundable setup fee. Bands match the PRD worked examples."""
    if total_budget_rwf < 400_000:
        return 30_000
    if total_budget_rwf < 1_000_000:
        return 50_000
    return 80_000


def platform_fee_rwf(total_budget_rwf: int, fee_percent: int) -> int:
    return (total_budget_rwf * fee_percent) // 100


def creator_pool_rwf(total_budget_rwf: int, fee_percent: int, setup_fee: int) -> int:
    pool = total_budget_rwf - platform_fee_rwf(total_budget_rwf, fee_percent) - setup_fee
    return max(0, pool)


def payout_from_views(
    *,
    views: int,
    rpm_rwf: int,
    min_views: int,
    min_payout_rwf: int,
    max_payout_rwf: int | None,
) -> int:
    """views * (rpm / 1000), then min-view, min-payout, and max-payout clamps."""
    if views < min_views:
        return 0
    raw = (views * rpm_rwf) // 1000
    if raw < min_payout_rwf:
        return 0
    if max_payout_rwf is not None and raw > max_payout_rwf:
        return max_payout_rwf
    return raw


def content_kind_for(campaign_type: str) -> str:
    lowered = campaign_type.lower()
    if "clip" in lowered:
        return "clipping"
    return "ugc"
