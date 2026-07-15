import VaultHero from "@/components/vault-3d/VaultHero";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12">
      <h1 className="mb-6 text-center text-4xl font-light tracking-tight text-gold">
        Chronos
      </h1>
      <VaultHero progress={0.3} />
    </main>
  );
}
