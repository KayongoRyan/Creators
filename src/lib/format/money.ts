export function formatRwf(amount: number) {
  return `RWF ${amount.toLocaleString("en-US")}`;
}

export function centsToRwf(cents: number) {
  return Math.round(cents / 100);
}

export function formatCampaignStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
