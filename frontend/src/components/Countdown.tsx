"use client";

import { useEffect, useState } from "react";
import FlipDigit from "./FlipDigit";

function pad(n: number, len = 2) {
  return String(Math.max(0, n)).padStart(len, "0");
}

function breakdown(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function Unit({ label, value, digits }: { label: string; value: number; digits: number }) {
  const str = pad(value, digits);
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <div className="flex text-xl font-semibold text-silver sm:text-2xl">
        {str.split("").map((ch, i) => (
          <FlipDigit key={i} value={ch} />
        ))}
      </div>
      <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.15em] text-silver/50 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

export default function Countdown({ unlockAt }: { unlockAt: number }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingSeconds = Math.max(0, unlockAt - Math.floor(now / 1000));
  const { days, hours, minutes, seconds } = breakdown(remainingSeconds);

  if (remainingSeconds <= 0) {
    return (
      <div className="text-center text-xl font-medium text-success">
        Ready to withdraw
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center gap-2 sm:gap-3">
      <Unit label="Days" value={days} digits={2} />
      <Unit label="Hours" value={hours} digits={2} />
      <Unit label="Minutes" value={minutes} digits={2} />
      <Unit label="Seconds" value={seconds} digits={2} />
    </div>
  );
}
