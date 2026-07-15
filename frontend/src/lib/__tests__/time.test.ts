import { describe, expect, it } from "vitest";
import { pad, breakdown } from "../time";

describe("pad", () => {
  it("left-pads with zeros to the given length", () => {
    expect(pad(3, 2)).toBe("03");
    expect(pad(42, 2)).toBe("42");
  });

  it("clamps negative values to zero instead of rendering a minus sign", () => {
    expect(pad(-5, 2)).toBe("00");
  });

  it("does not truncate values wider than the pad length", () => {
    expect(pad(123, 2)).toBe("123");
  });
});

describe("breakdown", () => {
  it("splits seconds into days/hours/minutes/seconds", () => {
    // 1 day, 2 hours, 3 minutes, 4 seconds
    const total = 1 * 86400 + 2 * 3600 + 3 * 60 + 4;
    expect(breakdown(total)).toEqual({
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    });
  });

  it("returns all zeros at exactly zero seconds", () => {
    expect(breakdown(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("clamps negative input (past unlock time) to zero rather than going negative", () => {
    expect(breakdown(-500)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("floors fractional seconds", () => {
    expect(breakdown(59.9)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 59 });
  });
});
