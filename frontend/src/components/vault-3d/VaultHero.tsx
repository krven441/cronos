"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const VaultScene = dynamic(() => import("./VaultScene"), { ssr: false });

export default function VaultHero({ progress = 0 }: { progress?: number }) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 480px)");
    setReduced(mql.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);

  return (
    <div className="relative h-[320px] w-full sm:h-[420px] md:h-[520px]">
      <VaultScene progress={progress} reduced={reduced} />
    </div>
  );
}
