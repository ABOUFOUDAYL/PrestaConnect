import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-primary-foreground">P</span>
              </div>
              <span className="font-bold">
                Presta<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Marketplace de services de confiance au Bénin 🇧🇯
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Plateforme</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/explore" className="hover:text-foreground transition-colors">
                  Explorer
                </Link>
              </li>
              <li>
                <Link href="/prestataires" className="hover:text-foreground transition-colors">
                  Prestataires
                </Link>
              </li>
              <li>
                <Link href="/register/provider" className="hover:text-foreground transition-colors">
                  Devenir prestataire
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Entreprise</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/solutions" className="hover:text-foreground transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-foreground transition-colors">
                  Tarifs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/ressources" className="hover:text-foreground transition-colors">
                  Ressources
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} PrestaConnect Bénin. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
