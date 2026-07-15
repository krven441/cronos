import { describe, expect, it } from "vitest";
import { stroopsToXlm, xlmToStroops } from "../balance";

describe("stroopsToXlm", () => {
  it("converts stroops to XLM at the 10^7 rate", () => {
    expect(stroopsToXlm(10_000_000n)).toBe(1);
    expect(stroopsToXlm(1_000_000_000n)).toBe(100);
  });

  it("handles zero", () => {
    expect(stroopsToXlm(0n)).toBe(0);
  });

  it("preserves sub-XLM precision", () => {
    expect(stroopsToXlm(1_500_000n)).toBeCloseTo(0.15, 10);
  });
});

describe("xlmToStroops", () => {
  it("converts XLM to stroops at the 10^7 rate", () => {
    expect(xlmToStroops(1)).toBe(10_000_000n);
    expect(xlmToStroops(100)).toBe(1_000_000_000n);
  });

  it("rounds to the nearest stroop instead of truncating", () => {
    // 0.00000005 XLM = 0.5 stroops, rounds to 1
    expect(xlmToStroops(0.00000005)).toBe(1n);
  });

  it("round-trips through stroopsToXlm for whole XLM amounts", () => {
    const stroops = xlmToStroops(42);
    expect(stroopsToXlm(stroops)).toBe(42);
  });
});
