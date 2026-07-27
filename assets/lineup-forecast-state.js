export function forecastAgeDays(value, now = Date.now()) {
  const checked = new Date(`${value}T00:00:00Z`).getTime();
  if (!Number.isFinite(checked)) return Number.POSITIVE_INFINITY;
  return Math.floor((now - checked) / 86400000);
}

export function isForecastStale(payload, now = Date.now()) {
  return (
    forecastAgeDays(payload?.last_checked, now) >
    (payload?.freshness?.stale_after_days ?? 7)
  );
}

export function forecastFailureMode(existingPayload) {
  return existingPayload ? "preserve-current" : "initial-error";
}
