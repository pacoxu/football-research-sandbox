// Date helpers shared by the site pages.
// Source data stores calendar dates as ISO strings (YYYY-MM-DD) without a time zone.

export function formatIsoDate(value, { locale = "zh-CN", language = "zh" } = {}) {
  if (!value) {
    return "-";
  }

  // The value is parsed as UTC midnight, so it must also be printed in UTC.
  // Without timeZone, visitors west of UTC see the previous calendar day.
  const options =
    language === "en"
      ? { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }
      : { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" };

  return new Intl.DateTimeFormat(locale, options).format(new Date(`${value}T00:00:00Z`));
}

export function getLocalIsoDate(now = new Date()) {
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}
