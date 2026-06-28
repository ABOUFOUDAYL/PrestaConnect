import Link from "next/link";

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
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#1877F2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>f</a>
              <a href="https://wa.me/2290140278943" target="_blank" rel="noopener noreferrer"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>w</a>
              <a href="mailto:sabirousayo@gmail.com"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#E63946", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>@</a>
            </div>
          </div>
          {[
            { title: "Plateforme", links: [{ label: "Explorer", href: "/explore" }, { label: "Comment ça marche", href: "/solutions" }] },
            { title: "Artisans", links: [{ label: "S'inscrire", href: "/register/provider" }, { label: "Tarifs", href: "/tarifs" }] },
            { title: "Aide", links: [{ label: "Contact", href: "/contact" }, { label: "FAQ", href: "/about" }] },
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