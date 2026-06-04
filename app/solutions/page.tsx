import Link from "next/link";
import { ArrowRight, Users, Building2, Truck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

const solutions = [
  {
    icon: Users,
    title: "Particuliers",
    description:
      "Trouvez un plombier, électricien ou coiffeur vérifié près de chez vous à Cotonou et dans tout le Bénin.",
    href: "/explore",
  },
  {
    icon: Building2,
    title: "Entreprises & PME",
    description:
      "Externalisez vos besoins en maintenance, ménage ou logistique avec des prestataires certifiés.",
    href: "/tarifs",
  },
  {
    icon: Truck,
    title: "Prestataires",
    description:
      "Développez votre activité, gérez vos réservations et recevez vos paiements via Mobile Money.",
    href: "/register/provider",
  },
];

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        title="Nos solutions"
        description="Des outils adaptés aux besoins des Béninois, particuliers comme professionnels."
      />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 md:grid-cols-3 md:px-6">
        {solutions.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <item.icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
            <Button
              variant="link"
              className="mt-4 h-auto p-0"
              render={<Link href={item.href} />}
            >
              En savoir plus
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}
