import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer style={{ background: "#020617", color: "#fff", padding: "48px 20px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 10, fontFamily: "Sora, sans-serif" }}>
              Presta<span style={{ color: "#FB6B72" }}>Connect</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, maxWidth: 220 }}>
              La première plateforme artisanale du Bénin. Simple, rapide, local.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <a href="https://web.facebook.com/profile.php?id=61591381834280" target="_blank" rel="noopener noreferrer"
                aria-label="Facebook"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.87h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"/>
                </svg>
              </a>
              <a href="https://wa.me/2290140278943" target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 5L2 22l5.13-1.35A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm5.86 14.14c-.25.7-1.24 1.28-2.02 1.45-.54.11-1.24.2-3.6-.77-3.02-1.25-4.97-4.29-5.12-4.49-.15-.2-1.22-1.62-1.22-3.09s.76-2.19 1.03-2.49c.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.54-.15.15-.31.31-.13.61.18.3.79 1.3 1.7 2.11 1.17 1.04 2.16 1.37 2.46 1.52.3.15.47.13.65-.08.18-.2.76-.89.96-1.2.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.23.57.35.07.13.07.75-.18 1.45Z"/>
                </svg>
              </a>
              <a href="mailto:sabirousayo@gmail.com"
                aria-label="Email"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#E63946", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
                <Mail size={16} color="#fff" />
              </a>
            </div>
          </div>
          {[
            { title: "Plateforme", links: [{ label: "Explorer", href: "/artisans" }, { label: "Comment ça marche", href: "/solutions" }] },
            { title: "Artisans", links: [{ label: "S'inscrire", href: "/artisan-register" }, { label: "Tarifs", href: "/tarifs" }] },
            { title: "Aide", links: [{ label: "Contact", href: "/contact" }, { label: "FAQ", href: "/faq" }] },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#E2E8F0", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" as const, fontFamily: "Sora, sans-serif" }}>{col.title}</div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12, fontSize: 12, color: "#334155", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
          <span>© {new Date().getFullYear()} PrestaConnect Bénin · Tous droits réservés</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/mentions-legales" style={{ color: "#334155", textDecoration: "none" }}>Mentions légales</Link>
            <Link href="/confidentialite" style={{ color: "#334155", textDecoration: "none" }}>Confidentialité</Link>
            <Link href="/cgu" style={{ color: "#334155", textDecoration: "none" }}>CGU</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}