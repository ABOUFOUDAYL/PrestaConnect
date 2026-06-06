"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImpersonation, ROLES } from "@/contexts/ImpersonationContext";

const marketingLinks = [
  { href: "/solutions", label: "Solutions" },
  { href: "/prestataires", label: "Prestataires" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/ressources", label: "Ressources" },
];

const marketingRoutes = [
  "/",
  "/solutions",
  "/prestataires",
  "/tarifs",
  "/ressources",
  "/explore",
  "/login",
  "/register",
  "/about",
  "/contact",
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { activeUser } = useImpersonation();
  const isLoggedIn = !!activeUser && activeUser.role !== ROLES.VISITEUR;

  const isMarketing = marketingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Si visiteur clique "Trouver un prestataire" → login puis redirect
  function handleTrouverPrestataire() {
    if (!isLoggedIn) {
      router.push("/login?redirect=/prestataires");
    } else {
      router.push("/prestataires");
    }
  }

  if (!isMarketing) {
    return <AppNavbar />;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[var(--navbar-height)] border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Presta<span className="text-primary">Connect</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── DESKTOP : boutons à droite ── */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le thème"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Trouver un prestataire — visible par tous, redirige vers login si visiteur */}
          <Button variant="ghost" onClick={handleTrouverPrestataire}>
            Trouver un prestataire
          </Button>

          {/* Connexion — visible uniquement si non connecté */}
          {!isLoggedIn && (
            <Button variant="ghost" render={<Link href="/login" />}>
              Connexion
            </Button>
          )}

          {/* Avatar — visible si connecté */}
          {isLoggedIn && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground cursor-pointer">
              {activeUser.name?.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Devenir prestataire — caché si déjà prestataire ou admin */}
          {(!isLoggedIn || activeUser?.role === ROLES.CLIENT) && (
            <Button render={<Link href="/register/provider" />}>
              Devenir Prestataire
            </Button>
          )}
        </div>

        {/* ── MOBILE : burger ── */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le thème"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── MENU MOBILE ── */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <hr className="my-2 border-border" />

            {/* Trouver un prestataire mobile */}
            <button
              onClick={() => { handleTrouverPrestataire(); setMobileOpen(false); }}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted text-left"
            >
              Trouver un prestataire
            </button>

            {/* Connexion mobile — si non connecté */}
            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Connexion
              </Link>
            )}

            {/* Devenir prestataire mobile — si non prestataire */}
            {(!isLoggedIn || activeUser?.role === ROLES.CLIENT) && (
              <Link href="/register/provider" onClick={() => setMobileOpen(false)}>
                <Button className="mt-2 w-full">Devenir Prestataire</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function AppNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[var(--navbar-height)] items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">PC</span>
        </div>
        <span className="hidden text-lg font-bold sm:block">
          Presta<span className="text-primary">Connect</span>
        </span>
      </Link>
      <Button render={<Link href="/" />}>Retour au site</Button>
    </header>
  );
}