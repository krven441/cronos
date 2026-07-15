"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function ProgressRing({
  progress,
  size = 220,
  strokeWidth = 4,
}: {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const spring = useSpring(0, { stiffness: 40, damping: 20, mass: 1 });
  useEffect(() => {
    spring.set(Math.min(1, Math.max(0, progress)));
  }, [progress, spring]);

  const dashoffset = useTransform(spring, (v) => circumference * (1 - v));

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute inset-0 m-auto -rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(213,215,221,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E6C16A"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={circumference}
        style={{ strokeDashoffset: dashoffset }}
      />
    </svg>
  );
}
