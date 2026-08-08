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

export interface StoreStatusInfo {
  canOrder: boolean;
  label: string;
  detail: string;
  kind: "open" | "limited" | "closed" | "closed-hours" | "delivery-off";
}

export function getStoreStatus(settings: StoreSettingsInput, now: Date = new Date()): StoreStatusInfo {
  const hours = parseHours(settings.hours);
  const day = now.getDay();
  const today = hours.find((h) => h.day === day);
  const minutes = now.getHours() * 60 + now.getMinutes();
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
