import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chronos — Time-Locked Vault",
  description: "A premium time-locked vault on Stellar Soroban.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
