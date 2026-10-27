export function formatDate(value: string | Date, locale = "en-US") {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
  }).format(date);
}
