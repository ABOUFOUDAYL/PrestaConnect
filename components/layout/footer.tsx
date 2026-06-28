import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex flex-col items-center md:items-start gap-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <span className="text-xs font-bold text-primary-foreground">P</span>
              </div>
              <span className="font-bold text-base">
                Presta<span className="text-primary">Connect</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Marketplace de services de confiance au Bénin 🇧🇯
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-foreground transition-colors">Explorer</Link>
            <Link href="/register/provider" className="hover:text-foreground transition-colors">Devenir prestataire</Link>
            <Link href="/about" className="hover:text-foreground transition-colors">À propos</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/tarifs" className="hover:text-foreground transition-colors">Tarifs</Link>
          </nav>

          <div className="flex items-center gap-3">
            <a href="https://web.facebook.com/profile.php?id=61591381834280"
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-white transition-colors text-muted-foreground text-sm font-bold">
              f
            </a>
            <a href="https://wa.me/2290140278943"
              target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-green-500 hover:text-white transition-colors text-muted-foreground text-sm font-bold">
              w
            </a>
            <a href="mailto:sabirousayo@gmail.com"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-white transition-colors text-muted-foreground text-sm font-bold">
              @
            </a>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} PrestaConnect Bénin. Tous droits réservés.</span>
          <div className="flex gap-4">
            <Link href="/cgu" className="hover:text-foreground transition-colors">CGU</Link>
            <Link href="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}