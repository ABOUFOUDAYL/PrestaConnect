import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="À propos de PrestaConnect"
        description="La marketplace de services pensée pour le Bénin."
      />
      <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p>
            PrestaConnect connecte les Béninois aux meilleurs prestataires de
            services — plombiers, électriciens, coiffeur·se·s, livreurs et bien
            plus — partout à Cotonou, Porto-Novo, Parakou et dans les
            communes du pays.
          </p>
          <p>
            Notre mission : rendre l&apos;accès aux services professionnels
            simple, sûr et accessible, avec des paiements en FCFA via Mobile
            Money (MTN, Moov) et une vérification rigoureuse des prestataires.
          </p>
        </div>
        <Link
          href="/register/provider"
          className="mt-8 inline-block font-medium text-primary hover:underline"
        >
          Rejoindre la plateforme →
        </Link>
      </div>
    </>
  );
}
