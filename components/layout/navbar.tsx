"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useImpersonation } from "@/contexts/impersonation-context";
import { supabase } from "@/lib/supabase";

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
  const { impersonated } = useImpersonation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isMarketing = marketingRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

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
          <img src="/logo.svg" alt="PrestaConnect" style={{height:"40px", width:"auto"}} />
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

        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Button variant="ghost" onClick={handleTrouverPrestataire}>
            Trouver un prestataire
          </Button>

          {!isLoggedIn && (
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Connexion
            </Button>
          )}

          {isLoggedIn && (
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              Mon espace
            </Button>
          )}

          {!isLoggedIn && (
            <Button onClick={() => router.push('/register/provider')}>
              Devenir Prestataire
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le theme"
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

            <button
              onClick={() => { handleTrouverPrestataire(); setMobileOpen(false); }}
              className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted text-left"
            >
              Trouver un prestataire
            </button>

            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Connexion
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Mon espace
              </Link>
            )}

            {!isLoggedIn && (
              <Button
                className="mt-2 w-full"
                onClick={() => { router.push('/register/provider'); setMobileOpen(false); }}
              >
                Devenir Prestataire
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function AppNavbar() {
  const router = useRouter();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-[var(--navbar-height)] items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <img src="/logo.svg" alt="PrestaConnect" style={{height:"32px", width:"auto"}} />
      </Link>
      <Button onClick={() => router.push('/')}>
        Retour au site
      </Button>
    </header>
  );
}