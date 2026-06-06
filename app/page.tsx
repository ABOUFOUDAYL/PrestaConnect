"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Wallet, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, Search } from "lucide-react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
];

const MARQUEE_WORDS = [
  "Électricien", "Plombier", "Maçon", "Menuisier", "Peintre",
  "Carreleur", "Soudeur", "Climatisation", "Toiture", "Jardinage",
];

export default function HomePage() {
  const [currentImg, setCurrentImg] = useState(0);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  // Slideshow hero
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentImg((i) => (i + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible((v) => ({ ...v, [e.target.id]: true }));
          }
        });
      },
      { threshold: 0.15 }
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function addRef(id: string) {
    return (el: HTMLElement | null) => {
      refs.current[id] = el;
    };
  }

  function revealClass(id: string, delay = "0ms") {
    return {
      opacity: visible[id] ? 1 : 0,
      transform: visible[id] ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
    };
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .syne { font-family: 'Syne', sans-serif; }

        .marquee-track {
          display: flex;
          gap: 48px;
          animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .img-slide {
          position: absolute; inset: 0;
          object-fit: cover; width: 100%; height: 100%;
          transition: opacity 1s ease;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #2563eb; color: #fff;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 999px;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-primary:hover { background: #1d4ed8; transform: scale(1.03); }

        .btn-dark {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: #0f172a;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 999px;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .btn-dark:hover { background: #f1f5f9; transform: scale(1.03); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #2563eb;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          padding: 13px 28px; border-radius: 999px;
          border: 2px solid #2563eb; cursor: pointer; text-decoration: none;
          transition: all 0.2s;
        }
        .btn-outline:hover { background: #2563eb; color: #fff; }

        .card-hover {
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
      `}</style>

      <main style={{ fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

        {/* ═══════════════════════════════════════
            HERO — fond sombre + slideshow images
        ═══════════════════════════════════════ */}
        <section style={{
          position: "relative", minHeight: "100vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0a0f1e", overflow: "hidden",
          paddingTop: "var(--navbar-height, 64px)",
        }}>
          {/* Images en fond qui alternent */}
          {HERO_IMAGES.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="img-slide"
              style={{ opacity: i === currentImg ? 0.35 : 0 }}
            />
          ))}

          {/* Overlay dégradé */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(10,15,30,0.5) 0%, rgba(10,15,30,0.85) 100%)",
          }} />

          {/* Contenu */}
          <div style={{
            position: "relative", zIndex: 2,
            maxWidth: 780, margin: "0 auto",
            padding: "80px 24px", textAlign: "center",
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-block",
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(37,99,235,0.5)",
              color: "#60a5fa", borderRadius: 999,
              padding: "6px 18px", fontSize: 13, fontWeight: 600,
              marginBottom: 28, letterSpacing: "0.05em",
            }}>
              🇧🇯 La première plateforme artisanale du Bénin
            </div>

            <h1 className="syne" style={{
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              fontWeight: 800, color: "#fff",
              lineHeight: 1.1, marginBottom: 24,
            }}>
              Trouvez un artisan<br />
              <span style={{ color: "#2563eb" }}>de confiance,</span><br />
              simplement et rapidement
            </h1>

            <p style={{
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              color: "#94a3b8", maxWidth: 560,
              margin: "0 auto 40px", lineHeight: 1.7,
            }}>
              PrestaConnect connecte directement les particuliers avec les meilleurs professionnels locaux — électriciens, plombiers, maçons et bien plus.
            </p>

            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/explore" className="btn-primary">
                <Search size={18} /> Trouver un prestataire
              </Link>
              <Link href="/register/provider" className="btn-dark">
                Devenir Prestataire <ArrowRight size={18} />
              </Link>
            </div>

            {/* Stats flottantes */}
            <div style={{
              display: "flex", gap: 32, justifyContent: "center",
              marginTop: 56, flexWrap: "wrap",
            }}>
              {[
                { value: "100%", label: "Béninois" },
                { value: "10+", label: "Domaines" },
                { value: "0%", label: "Commission" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div className="syne" style={{
                    fontSize: "2rem", fontWeight: 800, color: "#2563eb",
                  }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Flèche scroll */}
          <div style={{
            position: "absolute", bottom: 32, left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s infinite",
            color: "#fff", opacity: 0.5, fontSize: 24,
          }}>↓</div>

          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateX(-50%) translateY(0); }
              50% { transform: translateX(-50%) translateY(8px); }
            }
          `}</style>
        </section>

        {/* ═══════════════════════════════════════
            MARQUEE — défilement des métiers
        ═══════════════════════════════════════ */}
        <div style={{
          background: "#2563eb", padding: "18px 0", overflow: "hidden",
        }}>
          <div style={{ display: "flex", gap: 48 }}>
            <div className="marquee-track">
              {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
                <span key={i} className="syne" style={{
                  fontSize: 15, fontWeight: 700,
                  color: "#fff", letterSpacing: "0.05em",
                  display: "flex", alignItems: "center", gap: 16,
                }}>
                  {w} <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SECTION 1 — Comment ça marche (blanc)
        ═══════════════════════════════════════ */}
        <section style={{ background: "#fff", padding: "100px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>

            <div
              id="s1"
              ref={addRef("s1")}
              style={{ ...revealClass("s1"), textAlign: "center", marginBottom: 64 }}
            >
              <span style={{
                background: "#eff6ff", color: "#2563eb",
                borderRadius: 999, padding: "5px 16px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Comment ça marche</span>
              <h2 className="syne" style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800, color: "#0f172a",
                marginTop: 16, lineHeight: 1.2,
              }}>
                Simple, rapide,<br />
                <span style={{ color: "#2563eb" }}>efficace.</span>
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}>
              {[
                {
                  num: "01", title: "Décrivez votre besoin",
                  desc: "Expliquez votre problème — fuite, panne électrique, travaux — en quelques secondes.",
                  img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
                  delay: "0ms",
                },
                {
                  num: "02", title: "On trouve l'artisan",
                  desc: "PrestaConnect alerte les professionnels qualifiés de votre zone immédiatement.",
                  img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
                  delay: "150ms",
                },
                {
                  num: "03", title: "Travail fait, payez après",
                  desc: "L'artisan intervient, vous validez le travail. Zéro avance, zéro risque.",
                  img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
                  delay: "300ms",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  id={`step-${step.num}`}
                  ref={addRef(`step-${step.num}`)}
                  className="card-hover"
                  style={{
                    ...revealClass(`step-${step.num}`, step.delay),
                    borderRadius: 24, overflow: "hidden",
                    border: "1px solid #f1f5f9",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                    <img
                      src={step.img}
                      alt={step.title}
                      style={{
                        width: "100%", height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <div style={{
                      position: "absolute", top: 16, left: 16,
                      background: "#2563eb", color: "#fff",
                      borderRadius: 999, width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="syne" style={{ fontWeight: 800, fontSize: 13 }}>{step.num}</span>
                    </div>
                  </div>
                  <div style={{ padding: "24px" }}>
                    <h3 className="syne" style={{
                      fontSize: "1.2rem", fontWeight: 700,
                      color: "#0f172a", marginBottom: 8,
                    }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 2 — Tarifs (fond sombre)
        ═══════════════════════════════════════ */}
        <section style={{ background: "#0a0f1e", padding: "100px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>

            <div
              id="tarifs-title"
              ref={addRef("tarifs-title")}
              style={{ ...revealClass("tarifs-title"), textAlign: "center", marginBottom: 56 }}
            >
              <span style={{
                background: "rgba(37,99,235,0.15)", color: "#60a5fa",
                borderRadius: 999, padding: "5px 16px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Tarifs artisans</span>
              <h2 className="syne" style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800, color: "#fff",
                marginTop: 16, lineHeight: 1.2,
              }}>
                Un modèle transparent,{" "}
                <span style={{ color: "#2563eb" }}>sans abonnement</span>
              </h2>
              <p style={{ color: "#64748b", maxWidth: 560, margin: "16px auto 0", lineHeight: 1.7 }}>
                Chez PrestaConnect, vous ne payez aucun frais mensuel fixe. Vous ne dépensez que lorsque vous trouvez des opportunités réelles.
              </p>
            </div>

            {/* Cartes tarifs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 40 }}>
              {[
                {
                  icon: "⚡", label: "Cas urgent",
                  price: "300", tag: "FCFA / lead",
                  desc: "Intervention rapide, besoin immédiat. Débloquez le contact en un clic.",
                  delay: "0ms",
                },
                {
                  icon: "🏗️", label: "Grand chantier",
                  price: "1500", tag: "FCFA / lead",
                  desc: "Travaux importants à forte valeur. Un seul chantier rentabilise des dizaines de recharges.",
                  delay: "150ms",
                },
              ].map((t) => (
                <div
                  key={t.label}
                  id={`tarif-${t.label}`}
                  ref={addRef(`tarif-${t.label}`)}
                  className="card-hover"
                  style={{
                    ...revealClass(`tarif-${t.label}`, t.delay),
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 24, padding: 32,
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{t.icon}</div>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.label}</div>
                  <div className="syne" style={{ fontSize: "3rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{t.price}</div>
                  <div style={{ color: "#2563eb", fontWeight: 600, marginBottom: 16 }}>{t.tag}</div>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{t.desc}</p>
                </div>
              ))}
            </div>

            {/* Avantages grille */}
            <div
              id="avantages"
              ref={addRef("avantages")}
              style={{
                ...revealClass("avantages", "200ms"),
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {[
                { icon: <CheckCircle2 size={20} />, color: "#22c55e", title: "Zéro engagement", desc: "Pas de contrat, pas de prélèvement automatique." },
                { icon: <UserCheck size={20} />, color: "#2563eb", title: "Clients qualifiés", desc: "Vous ne débloquez que si ça correspond à votre métier." },
                { icon: <Wallet size={20} />, color: "#f59e0b", title: "Mobile Money", desc: "Recharges via MTN ou Moov Money à partir de 500 FCFA." },
                { icon: <ShieldCheck size={20} />, color: "#a855f7", title: "Rentabilité assurée", desc: "Un chantier suffit à rentabiliser des dizaines de leads." },
              ].map((a) => (
                <div key={a.title} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: "20px",
                  display: "flex", gap: 14, alignItems: "flex-start",
                }}>
                  <div style={{
                    color: a.color, flexShrink: 0,
                    background: `${a.color}18`, borderRadius: 10,
                    padding: 8, display: "flex",
                  }}>{a.icon}</div>
                  <div>
                    <div className="syne" style={{ fontWeight: 700, color: "#fff", fontSize: 14, marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 3 — Galerie métiers (blanc)
        ═══════════════════════════════════════ */}
        <section style={{ background: "#f8fafc", padding: "100px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div
              id="metiers-title"
              ref={addRef("metiers-title")}
              style={{ ...revealClass("metiers-title"), textAlign: "center", marginBottom: 56 }}
            >
              <h2 className="syne" style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                fontWeight: 800, color: "#0f172a", lineHeight: 1.2,
              }}>
                Tous les métiers,<br />
                <span style={{ color: "#2563eb" }}>partout au Bénin.</span>
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 16,
            }}>
              {[
                { label: "Électricien", emoji: "⚡", color: "#fef3c7" },
                { label: "Plombier", emoji: "🔧", color: "#dbeafe" },
                { label: "Maçon", emoji: "🧱", color: "#fce7f3" },
                { label: "Menuisier", emoji: "🪵", color: "#dcfce7" },
                { label: "Peintre", emoji: "🖌️", color: "#f3e8ff" },
                { label: "Carreleur", emoji: "🏠", color: "#ffedd5" },
                { label: "Soudeur", emoji: "🔥", color: "#fee2e2" },
                { label: "Clim", emoji: "❄️", color: "#e0f2fe" },
              ].map((m, i) => (
                <div
                  key={m.label}
                  id={`metier-${i}`}
                  ref={addRef(`metier-${i}`)}
                  className="card-hover"
                  style={{
                    ...revealClass(`metier-${i}`, `${i * 60}ms`),
                    background: m.color, borderRadius: 20,
                    padding: "28px 16px", textAlign: "center",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{m.emoji}</div>
                  <div className="syne" style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CTA FINAL — texte défilant (noir)
        ═══════════════════════════════════════ */}
        <section style={{
          background: "#0a0f1e", padding: "80px 24px",
          overflow: "hidden", position: "relative",
        }}>
          {/* Gros texte défilant en fond */}
          <div style={{
            overflow: "hidden", marginBottom: 60,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            padding: "20px 0",
          }}>
            <div className="marquee-track syne" style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 800, color: "rgba(255,255,255,0.06)",
              letterSpacing: "-0.02em",
            }}>
              {["Trouvez un artisan", "·", "Trouvez un artisan", "·", "Trouvez un artisan", "·", "Trouvez un artisan", "·"].map((w, i) => (
                <span key={i} style={{ marginRight: 48 }}>{w}</span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div
              id="cta"
              ref={addRef("cta")}
              style={revealClass("cta")}
            >
              <h2 className="syne" style={{
                fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: 800, color: "#fff",
                lineHeight: 1.15, marginBottom: 24,
              }}>
                Prêt à trouver votre<br />
                <span style={{ color: "#2563eb" }}>artisan de confiance ?</span>
              </h2>
              <p style={{ color: "#64748b", fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
                Rejoignez des milliers de Béninois qui font déjà confiance à PrestaConnect.
              </p>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/explore" className="btn-primary" style={{ fontSize: 16, padding: "16px 36px" }}>
                  <Search size={20} /> Trouver un prestataire
                </Link>
                <Link href="/register/provider" className="btn-outline" style={{ fontSize: 16, padding: "14px 36px" }}>
                  Devenir Prestataire <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════ */}
        <footer style={{
          background: "#020617", color: "#fff",
          padding: "48px 24px", textAlign: "center",
        }}>
          <div className="syne" style={{
            fontSize: "1.3rem", fontWeight: 800, marginBottom: 8,
          }}>
            Presta<span style={{ color: "#2563eb" }}>Connect</span>
          </div>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 24 }}>
            La première plateforme artisanale du Bénin
          </p>
          <div style={{
            display: "flex", gap: 32, justifyContent: "center",
            flexWrap: "wrap", marginBottom: 32,
          }}>
            {[
              { val: "100% Béninois", label: "Pensé pour le marché local" },
              { val: "10+ Domaines", label: "De métiers artisanaux" },
              { val: "0% Commission", label: "Sur vos chantiers réalisés" },
            ].map((s) => (
              <div key={s.val}>
                <div className="syne" style={{ fontSize: "1.4rem", fontWeight: 800, color: "#2563eb" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 24, fontSize: 12, color: "#334155",
            display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap",
          }}>
            <span>© 2025 PrestaConnect</span>
            <Link href="/contact" style={{ color: "#334155", textDecoration: "none" }}>Contact</Link>
            <Link href="/tarifs" style={{ color: "#334155", textDecoration: "none" }}>Tarifs</Link>
            <Link href="/solutions" style={{ color: "#334155", textDecoration: "none" }}>Solutions</Link>
          </div>
        </footer>

      </main>
    </>
  );
}