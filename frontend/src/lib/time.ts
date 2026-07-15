export function pad(n: number, len = 2): string {
  return String(Math.max(0, n)).padStart(len, "0");
}

export interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function breakdown(seconds: number): TimeBreakdown {
  const s = Math.max(0, Math.floor(seconds));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
