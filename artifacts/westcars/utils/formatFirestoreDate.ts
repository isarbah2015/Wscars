/** Normalize Firestore Timestamp / Date / ISO string to YYYY-MM-DD. */
export function toDateString(
  value: unknown,
  fallback = "",
): string {
  if (value == null || value === "") return fallback;

  if (typeof value === "string") {
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTimestamp.toDate === "function") {
      return maybeTimestamp.toDate().toISOString().slice(0, 10);
    }
    if (typeof maybeTimestamp.seconds === "number") {
      return new Date(maybeTimestamp.seconds * 1000).toISOString().slice(0, 10);
    }
  }

  return fallback;
}

/** Format for UI labels like "21 May, 14:30". */
export function toDisplayDateTime(value: unknown, fallback = "Recently"): string {
  if (value == null || value === "") return fallback;

  let date: Date | null = null;
  if (typeof value === "string") date = new Date(value);
  else if (value instanceof Date) date = value;
  else if (typeof value === "object") {
    const maybeTimestamp = value as { toDate?: () => Date; seconds?: number };
    if (typeof maybeTimestamp.toDate === "function") date = maybeTimestamp.toDate();
    else if (typeof maybeTimestamp.seconds === "number") {
      date = new Date(maybeTimestamp.seconds * 1000);
    }
  }

  if (!date || Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
