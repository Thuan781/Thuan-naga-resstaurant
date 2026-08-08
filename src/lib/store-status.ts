export interface StoreSettingsInput {
  storeStatus: "OPEN" | "LIMITED" | "CLOSED";
  hours: string;
  deliveryEnabled: boolean;
  emergencyMessage?: string | null;
}

export interface DayHours {
  day: number; // 0 = Sunday
  open: string; // "10:00"
  close: string; // "21:30"
  closed: boolean;
}

export function parseHours(json: string | null | undefined): DayHours[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as DayHours[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Restaurant hours are entered in Indian time, so the open/closed check must
// always use Asia/Kolkata — Vercel servers otherwise run in UTC and would
// misjudge the current time.
export const RESTAURANT_TZ = "Asia/Kolkata";

function currentDayMinutes(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    day: dayMap[get("weekday")] ?? new Date().getDay(),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export interface StoreStatusInfo {
  canOrder: boolean;
  label: string;
  detail: string;
  kind: "open" | "limited" | "closed" | "closed-hours" | "delivery-off";
}

export function getStoreStatus(settings: StoreSettingsInput): StoreStatusInfo {
  const hours = parseHours(settings.hours);
  const { day, minutes } = currentDayMinutes();
  const today = hours.find((h) => h.day === day);
  const withinHours = !!today && !today.closed && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close);
  const closeLabel = today && !today.closed ? `Closes at ${today.close}` : "";

  if (settings.storeStatus === "CLOSED") {
    return {
      canOrder: false,
      label: "Closed",
      detail: settings.emergencyMessage || "We're closed right now. See you soon!",
      kind: "closed",
    };
  }

  if (!withinHours) {
    const hoursText = today && !today.closed ? `${today.open} – ${today.close}` : "today";
    return {
      canOrder: false,
      label: "Closed",
      detail: today?.closed
        ? "We're closed today. Order again tomorrow!"
        : `We open at ${today?.open ?? "—"} today. Our hours are ${hoursText}.`,
      kind: "closed-hours",
    };
  }

  if (settings.storeStatus === "LIMITED") {
    return {
      canOrder: true,
      label: "Limited Service",
      detail: "Cash on Delivery only right now.",
      kind: "limited",
    };
  }

  if (!settings.deliveryEnabled) {
    return {
      canOrder: false,
      label: "Paused",
      detail: "We've paused online orders. Check back soon!",
      kind: "delivery-off",
    };
  }

  return {
    canOrder: true,
    label: "Open now",
    detail: closeLabel || "Taking orders",
    kind: "open",
  };
}

export const DAY_NAMES_FULL = DAY_NAMES;
