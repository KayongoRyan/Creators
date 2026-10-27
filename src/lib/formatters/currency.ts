export function formatCurrency(
  amountCents: number,
  currency = "USD",
  locale = "en-US",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}
