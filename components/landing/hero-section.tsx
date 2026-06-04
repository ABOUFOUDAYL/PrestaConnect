import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe,
  MapPin,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Recherchez",
    description:
      "Parcourez les prestataires vérifiés près de chez vous à Cotonou, Porto-Novo, Parakou et dans tout le Bénin.",
  },
  {
    step: "02",
    title: "Réservez",
    description:
      "Choisissez un créneau, confirmez votre demande et suivez l'avancement en temps réel.",
  },
  {
    step: "03",
    title: "Payez en sécurité",
    description:
      "Réglez via Mobile Money (MTN, Moov) ou carte. Le paiement est libéré après validation du service.",
  },
];

const services = [
  "Plomberie",
  "Électricité",
  "Ménage",
  "Coiffure",
  "Livraison",
  "Réparation auto",
];

export function HeroSection() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 md:px-6 md:py-20 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              <Globe className="h-3.5 w-3.5" />
              Plateforme n°1 au Bénin 🇧🇯
            </Badge>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-primary sm:text-5xl lg:text-[3.25rem]">
                Trouvez des prestataires vérifiés en un clic
              </h1>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                La marketplace de services de confiance au Bénin. Connectez-vous
                à des experts qualifiés pour vos besoins du quotidien — de
                Cadjehoun à Ganhi, de Akpakpa à Calavi.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-base"
                render={<Link href="/explore" />}
              >
                Commencer
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base"
                render={<Link href="/#comment-ca-marche" />}
              >
                Comment ça marche ?
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["KA", "FA", "MA", "YA"].map((initials, i) => (
                  <div
                    key={initials}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary/90 text-[10px] font-bold text-primary-foreground"
                    style={{ zIndex: 4 - i }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2 500+</span>{" "}
                professionnels vérifiés au Bénin
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-primary shadow-2xl shadow-primary/20 sm:aspect-square lg:aspect-[4/5]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
              <div className="absolute inset-0 opacity-20">
                <div className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-1/3 right-1/4 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="space-y-3 text-center text-primary-foreground/80">
                  <Shield className="mx-auto h-16 w-16 opacity-40" />
                  <p className="text-sm font-medium opacity-60">
                    Services vérifiés · Paiement sécurisé · Mobile Money
                  </p>
                </div>
              </div>

              <div className="absolute bottom-6 left-4 right-4 space-y-3 sm:left-6 sm:right-6">
                <div className="rounded-2xl border border-white/10 bg-white/95 p-4 shadow-xl backdrop-blur dark:bg-card/95">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      KA
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold text-foreground">
                          Kossi A.
                        </p>
                        <Badge className="shrink-0 gap-1 bg-success text-success-foreground hover:bg-success">
                          <BadgeCheck className="h-3 w-3" />
                          Vérifié
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Plombier · Cadjehoun
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      1,2 km
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/95 p-4 shadow-xl backdrop-blur dark:bg-card/95">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Mission validée
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Paiement Mobile Money débloqué
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 md:px-6">
          {services.map((service) => (
            <Link
              key={service}
              href={`/explore?service=${encodeURIComponent(service)}`}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {service}
            </Link>
          ))}
        </div>
      </section>

      <section id="comment-ca-marche" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">
              Simple & rapide
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Trois étapes pour trouver et réserver un prestataire de confiance
              au Bénin.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="text-4xl font-bold text-primary/20">
                  {item.step}
                </span>
                <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" render={<Link href="/explore" />}>
              Explorer les prestataires
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground md:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
          <div className="mx-auto mb-6 flex max-w-3xl flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              <span className="text-sm font-medium">4,8/5 satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="text-sm font-medium">Réponse en 15 min</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Paiement sécurisé FCFA</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Prêt à trouver votre prestataire ?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Rejoignez des milliers de Béninois qui font confiance à PrestaConnect
            pour leurs services au quotidien.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-12 rounded-full px-8"
              render={<Link href="/explore" />}
            >
              Commencer gratuitement
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-foreground/30 bg-transparent px-8 text-primary-foreground hover:bg-primary-foreground/10"
              render={<Link href="/register/provider" />}
            >
              Devenir prestataire
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
