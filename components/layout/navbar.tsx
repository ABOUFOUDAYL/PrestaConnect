"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
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
  "/login",
  "/register",
  "/artisan-register",
  "/about",
  "/contact",
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { impersonated } = useImpersonation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      router.push("/login?redirect=/recherche");
    } else {
      router.push("/recherche");
    }
  }

  if (!isMarketing) {
    return <AppNavbar />;
  }

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: "var(--topbar-height)",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          margin: "0 auto",
          maxWidth: "var(--container-xl)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 var(--space-6)",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.svg" alt="PrestaConnect" style={{ height: "40px", width: "auto" }} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: pathname === link.href ? 600 : 500,
                color: pathname === link.href ? "var(--text-brand)" : "var(--text-secondary)",
                textDecoration: "none",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            {mounted && theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={handleTrouverPrestataire}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--text-secondary)",
              padding: "8px 14px",
            }}
          >
            Trouver un prestataire
          </button>

          {!isLoggedIn && (
            <button
              onClick={() => router.push('/login')}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--text-secondary)",
                padding: "8px 14px",
              }}
            >
              Connexion
            </button>
          )}

          {isLoggedIn && (
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: "transparent",
                border: "none",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--text-secondary)",
                padding: "8px 14px",
              }}
            >
              Mon espace
            </button>
          )}

          {!isLoggedIn && (
            <button className="btn-primary" style={{ width: "auto", padding: "10px 20px" }} onClick={() => router.push('/artisan-register')}>
              Devenir Prestataire
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Changer le theme"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            {mounted && theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-default)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            padding: "16px",
          }}
          className="md:hidden"
        >
          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
            <hr className="divider" />

            <button
              onClick={() => { handleTrouverPrestataire(); setMobileOpen(false); }}
              style={{
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--text-primary)",
                background: "transparent",
                border: "none",
                textAlign: "left",
              }}
            >
              Trouver un prestataire
            </button>

            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
              >
                Connexion
              </Link>
            )}

            {isLoggedIn && (
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                style={{
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  fontSize: "var(--text-sm)",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                }}
              >
                Mon espace
              </Link>
            )}

            {!isLoggedIn && (
              <button
                className="btn-primary"
                style={{ marginTop: 8 }}
                onClick={() => { router.push('/artisan-register'); setMobileOpen(false); }}
              >
                Devenir Prestataire
              </button>
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
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        height: "var(--topbar-height)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border-default)",
        background: "var(--bg-surface)",
        backdropFilter: "blur(8px)",
        padding: "0 var(--space-6)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src="/logo.svg" alt="PrestaConnect" style={{ height: "32px", width: "auto" }} />
      </Link>
      <button className="btn-outline" style={{ width: "auto", padding: "8px 16px" }} onClick={() => router.push('/')}>
        Retour au site
      </button>
    </header>
  );
}