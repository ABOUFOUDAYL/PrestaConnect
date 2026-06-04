import Link from "next/link";
import { BookOpen, HelpCircle, FileText } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

const resources = [
  {
    icon: BookOpen,
    title: "Guide du débutant",
    description: "Comment réserver votre premier service sur PrestaConnect.",
    href: "/#comment-ca-marche",
  },
  {
    icon: HelpCircle,
    title: "Centre d'aide",
    description: "FAQ, paiements Mobile Money, annulations et litiges.",
    href: "/contact",
  },
  {
    icon: FileText,
    title: "Blog & actualités",
    description: "Conseils pour prestataires et clients au Bénin.",
    href: "/about",
  },
];

export default function RessourcesPage() {
  return (
    <>
      <PageHeader
        title="Ressources"
        description="Guides, aide et documentation pour bien utiliser PrestaConnect."
      />
      <div className="mx-auto grid max-w-3xl gap-4 px-4 py-8 md:px-6">
        {resources.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
          >
            <item.icon className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
