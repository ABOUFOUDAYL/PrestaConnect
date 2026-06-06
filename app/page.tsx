"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Wallet, CheckCircle2, UserCheck, ShieldCheck, ArrowRight, Search, Star, Zap, Users } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"client" | "prestataire">("client");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentImg((i) => (i + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible((v) => ({ ...v, [e.target.id]: true }));
        });
      },
      { threshold: 0.1 }
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function addRef(id: string) {
    return (el: HTMLElement | null) => { refs.current[id] = el; };
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
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .syne { font-family: 'Syne', sans-serif; }
        .marquee-track {
          display: flex; gap: 48px;
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
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #2563eb; color: #fff;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 999px;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #1d4ed8; transform: scale(1.03); }
        .btn-dark {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #fff; color: #0f172a;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 999px;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .btn-dark:hover { background: #f1f5f9; transform: scale(1.03); }
        .btn-green {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          background: #16a34a; color: #fff;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px;
          padding: 14px 28px; border-radius: 999px;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }
        .btn-green:hover { background: #15803d; transform: scale(1.03); }
        .card-hover { transition: transform 0.25s, box-shadow 0.25s; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .tab-btn {
          padding: 10px 20px; border-radius: 999px; font-weight: 700;
          font-size: 14px; cursor: pointer; border: 2px solid transparent;
          transition: all 0.2s; font-family: 'Syne', sans-serif;
          white-space: nowrap;
        }
        .tab-active-client { background: #2563eb; color: #fff; }
        .tab-active-prestataire { background: #16a34a; color: #fff; }
        .tab-inactive { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.2); }
        .tab-inactive:hover { background: rgba(255,255,255,0.2); color: #fff; }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
      `}</style>

      <main style={{ fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

        {/* HERO */}
        <section style={{
          position: "relative", minHeight: "100vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#0a0f1e", overflow: "hidden",
          paddingTop: "var(--navbar-height, 64px)",
        }}>
          {HERO_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="" className="img-slide"
              style={{ opacity: i === currentImg ? 0.35 : 0 }} />
          ))}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(10,15,30,0.5) 0%, rgba(10,15,30,0.9) 100%)",
          }} />

          <div style={{
            position: "relative", zIndex: 2,
            width: "100%", maxWidth: 860, margin: "0 auto",
            padding: "60px 20px 80px", textAlign: "center",
          }}>
            <div style={{
              display: "inline-block",
              background: "rgba(37,99,235,0.2)",
              border: "1px solid rgba(37,99,235,0.5)",
              color: "#60a5fa", borderRadius: 999,
              padding: "6px 16px", fontSize: 12, fontWeight: 600,
              marginBottom: 24, letterSpacing: "0.05em",
            }}>
              🇧🇯 La première plateforme artisanale du Bénin
            </div>

            {/* Tabs */}
            <div style={{
              display: "flex", gap: 10, justifyContent: "center",
              marginBottom: 36, flexWrap: "wrap",
            }}>
              <button className={`tab-btn ${activeTab === "client" ? "tab-active-client" : "tab-inactive"}`}
                onClick={() => setActiveTab("client")}>
                👤 Je cherche un artisan
              </button>
              <button className={`tab-btn ${activeTab === "prestataire" ? "tab-active-prestataire" : "tab-inactive"}`}
                onClick={() => setActiveTab("prestataire")}>
                🔨 Je suis artisan
              </button>
            </div>

            {activeTab === "client" && (
              <div>
                <h1 className="syne" style={{
                  fontSize: "clamp(2rem, 7vw, 4.5rem)",
                  fontWeight: 800, color: "#fff",
                  lineHeight: 1.15, marginBottom: 20,
                  wordBreak: "break-word",
                }}>
                  Trouvez un artisan<br />
                  <span style={{ color: "#2563eb" }}>de confiance,</span><br />
                  simplement et rapidement
                </h1>
                <p style={{
                  fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
                  color: "#94a3b8", maxWidth: 520,
                  margin: "0 auto 36px", lineHeight: 1.7,
                }}>
                  PrestaConnect connecte directement les particuliers avec les meilleurs professionnels locaux.
                </p>
                <div style={{
                  display: "flex", gap: 12, justifyContent: "center",
                  flexWrap: "wrap",
                }}>
                  <Link href="/explore" className="btn-primary">
                    <Search size={18} /> Trouver un prestataire
                  </Link>
                  <Link href="/login" className="btn-dark">
                    Se connecter <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "prestataire" && (
              <div>
                <h1 className="syne" style={{
                  fontSize: "clamp(2rem, 7vw, 4.5rem)",
                  fontWeight: 800, color: "#fff",
                  lineHeight: 1.15, marginBottom: 20,
                  wordBreak: "break-word",
                }}>
                  Développez votre<br />
                  <span style={{ color: "#22c55e" }}>activité au Bénin</span><br />
                  sans commission
                </h1>
                <p style={{
                  fontSize: "clamp(0.95rem, 2.5vw, 1.15rem)",
                  color: "#94a3b8", maxWidth: 520,
                  margin: "0 auto 36px", lineHeight: 1.7,
                }}>
                  Rejoignez PrestaConnect, recevez des missions près de chez vous. Zéro abonnement, zéro commission.
                </p>
                <div style={{
                  display: "flex", gap: 12, justifyContent: "center",
                  flexWrap: "wrap",
                }}>
                  <Link href="/register/provider" className="btn-green">
                    🔨 S'inscrire comme artisan <ArrowRight size={18} />
                  </Link>
                  <Link href="/tarifs" className="btn-dark">
                    Voir les tarifs
                  </Link>
                </div>
              </div>
            )}

            <div style={{
              display: "flex", gap: 24, justifyContent: "center",
              marginTop: 48, flexWrap: "wrap",
            }}>
              {[
                { value: "100%", label: "Béninois" },
                { value: "10+", label: "Domaines" },
                { value: "0%", label: "Commission" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div className="syne" style={{
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: 800,
                    color: activeTab === "prestataire" ? "#22c55e" : "#2563eb",
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: 24, left: "50%",
            transform: "translateX(-50%)",
            animation: "bounce 2s infinite",
            color: "#fff", opacity: 0.4, fontSize: 20,
          }}>↓</div>
        </section>

        {/* MARQUEE */}
        <div style={{ background: "#2563eb", padding: "16px 0", overflow: "hidden" }}>
          <div className="marquee-track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span key={i} className="syne" style={{
                fontSize: 14, fontWeight: 700, color: "#fff",
                letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 16,
              }}>
                {w} <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* DOUBLE CTA */}
        <section style={{ background: "#fff", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="deux-cotes" ref={addRef("deux-cotes")}
              style={{ ...revealClass("deux-cotes"), textAlign: "center", marginBottom: 48 }}>
              <span style={{
                background: "#eff6ff", color: "#2563eb",
                borderRadius: 999, padding: "5px 16px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Une plateforme, deux côtés</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 800, color: "#0f172a",
                marginTop: 16, lineHeight: 1.25,
              }}>
                Que vous soyez client<br />
                <span style={{ color: "#2563eb" }}>ou artisan,</span> PrestaConnect est fait pour vous.
              </h2>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
            }}>
              {/* Carte Client */}
              <div id="carte-client" ref={addRef("carte-client")} className="card-hover"
                style={{
                  ...revealClass("carte-client"),
                  background: "#eff6ff", borderRadius: 24,
                  padding: "32px 28px", border: "1px solid #bfdbfe",
                }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>👤</div>
                <h3 className="syne" style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  Vous cherchez un artisan ?
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
                  Trouvez en quelques clics un professionnel vérifié près de chez vous.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Prestataires vérifiés et certifiés", "Réponse en moins de 1h", "Zéro avance de frais", "Paiement après validation"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#1e40af", fontWeight: 500 }}>
                      <CheckCircle2 size={15} color="#2563eb" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/explore" className="btn-primary" style={{ width: "100%" }}>
                  <Search size={16} /> Trouver un artisan
                </Link>
              </div>

              {/* Carte Prestataire */}
              <div id="carte-presta" ref={addRef("carte-presta")} className="card-hover"
                style={{
                  ...revealClass("carte-presta", "150ms"),
                  background: "#f0fdf4", borderRadius: 24,
                  padding: "32px 28px", border: "1px solid #bbf7d0",
                }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔨</div>
                <h3 className="syne" style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>
                  Vous êtes artisan ?
                </h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
                  Recevez des missions qualifiées près de chez vous sans payer d'abonnement mensuel.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Zéro abonnement mensuel", "Clients dans votre zone", "Paiement via Mobile Money", "Profil certifié visible"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#166534", fontWeight: 500 }}>
                      <CheckCircle2 size={15} color="#16a34a" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register/provider" className="btn-green" style={{ width: "100%" }}>
                  S'inscrire comme artisan <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* COMMENT ÇA MARCHE */}
        <section style={{ background: "#f8fafc", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="s1" ref={addRef("s1")}
              style={{ ...revealClass("s1"), textAlign: "center", marginBottom: 48 }}>
              <span style={{
                background: "#eff6ff", color: "#2563eb",
                borderRadius: 999, padding: "5px 16px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Comment ça marche</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 800, color: "#0f172a",
                marginTop: 16, lineHeight: 1.25,
              }}>
                Simple, rapide,<br /><span style={{ color: "#2563eb" }}>efficace.</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[
                { num: "01", title: "Décrivez votre besoin", desc: "Expliquez votre problème en quelques secondes.", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80", delay: "0ms" },
                { num: "02", title: "On trouve l'artisan", desc: "PrestaConnect alerte les professionnels qualifiés de votre zone.", img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80", delay: "150ms" },
                { num: "03", title: "Travail fait, payez après", desc: "L'artisan intervient, vous validez. Zéro avance, zéro risque.", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80", delay: "300ms" },
              ].map((step) => (
                <div key={step.num} id={`step-${step.num}`} ref={addRef(`step-${step.num}`)} className="card-hover"
                  style={{
                    ...revealClass(`step-${step.num}`, step.delay),
                    borderRadius: 20, overflow: "hidden",
                    border: "1px solid #f1f5f9", background: "#fff",
                  }}>
                  <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                    <img src={step.img} alt={step.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", top: 12, left: 12,
                      background: "#2563eb", color: "#fff",
                      borderRadius: 999, width: 32, height: 32,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span className="syne" style={{ fontWeight: 800, fontSize: 12 }}>{step.num}</span>
                    </div>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <h3 className="syne" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{step.title}</h3>
                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section style={{ background: "#0a0f1e", padding: "80px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div id="tarifs-title" ref={addRef("tarifs-title")}
              style={{ ...revealClass("tarifs-title"), textAlign: "center", marginBottom: 48 }}>
              <span style={{
                background: "rgba(37,99,235,0.15)", color: "#60a5fa",
                borderRadius: 999, padding: "5px 16px",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}>Tarifs artisans</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 800, color: "#fff",
                marginTop: 16, lineHeight: 1.25,
              }}>
                Un modèle transparent,{" "}
                <span style={{ color: "#2563eb" }}>sans abonnement</span>
              </h2>
              <p style={{ color: "#64748b", maxWidth: 520, margin: "14px auto 0", lineHeight: 1.7, fontSize: 14 }}>
                Vous ne payez aucun frais mensuel fixe. Vous ne dépensez que lorsque vous trouvez des opportunités réelles.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { icon: "⚡", label: "Cas urgent", price: "300", tag: "FCFA / lead", desc: "Intervention rapide, besoin immédiat. Débloquez le contact en un clic.", delay: "0ms" },
                { icon: "🏗️", label: "Grand chantier", price: "1500", tag: "FCFA / lead", desc: "Travaux importants à forte valeur. Un seul chantier rentabilise des dizaines de recharges.", delay: "150ms" },
              ].map((t) => (
                <div key={t.label} id={`tarif-${t.label}`} ref={addRef(`tarif-${t.label}`)} className="card-hover"
                  style={{
                    ...revealClass(`tarif-${t.label}`, t.delay),
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20, padding: "28px 24px",
                  }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{t.label}</div>
                  <div className="syne" style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{t.price}</div>
                  <div style={{ color: "#2563eb", fontWeight: 600, marginBottom: 12, fontSize: 14 }}>{t.tag}</div>
                  <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7 }}>{t.desc}</p>
                </div>
              ))}
            </div>

            <div id="avantages" ref={addRef("avantages")}
              style={{
                ...revealClass("avantages", "200ms"),
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}>
              {[
                { icon: <CheckCircle2 size={18} />, color: "#22c55e", title: "Zéro engagement", desc: "Pas de contrat, pas de prélèvement automatique." },
                { icon: <UserCheck size={18} />, color: "#2563eb", title: "Clients qualifiés", desc: "Vous ne débloquez que si ça correspond à votre métier." },
                { icon: <Wallet size={18} />, color: "#f59e0b", title: "Mobile Money", desc: "Recharges via MTN ou Moov Money à partir de 500 FCFA." },
                { icon: <ShieldCheck size={18} />, color: "#a855f7", title: "Rentabilité assurée", desc: "Un chantier suffit à rentabiliser des dizaines de leads." },
              ].map((a) => (
                <div key={a.title} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "16px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{ color: a.color, flexShrink: 0, background: `${a.color}18`, borderRadius: 8, padding: 7, display: "flex" }}>{a.icon}</div>
                  <div>
                    <div className="syne" style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 3 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GALERIE MÉTIERS */}
        <section style={{ background: "#f8fafc", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="metiers-title" ref={addRef("metiers-title")}
              style={{ ...revealClass("metiers-title"), textAlign: "center", marginBottom: 40 }}>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.8rem)",
                fontWeight: 800, color: "#0f172a", lineHeight: 1.25,
              }}>
                Tous les métiers,<br />
                <span style={{ color: "#2563eb" }}>partout au Bénin.</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
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
                <div key={m.label} id={`metier-${i}`} ref={addRef(`metier-${i}`)} className="card-hover"
                  style={{
                    ...revealClass(`metier-${i}`, `${i * 60}ms`),
                    background: m.color, borderRadius: 16,
                    padding: "22px 12px", textAlign: "center", cursor: "pointer",
                  }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{m.emoji}</div>
                  <div className="syne" style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: "#0a0f1e", padding: "80px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
            <div id="cta" ref={addRef("cta")} style={revealClass("cta")}>
              <h2 className="syne" style={{
                fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                fontWeight: 800, color: "#fff",
                lineHeight: 1.2, marginBottom: 20,
              }}>
                Rejoignez la communauté<br />
                <span style={{ color: "#2563eb" }}>PrestaConnect</span>
              </h2>
              <p style={{ color: "#64748b", fontSize: 15, marginBottom: 36, lineHeight: 1.7 }}>
                Des milliers de Béninois — clients et artisans — font déjà confiance à PrestaConnect.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/explore" className="btn-primary" style={{ fontSize: 15, padding: "14px 28px" }}>
                  <Search size={18} /> Trouver un prestataire
                </Link>
                <Link href="/register/provider" className="btn-green" style={{ fontSize: 15, padding: "14px 28px" }}>
                  🔨 Devenir Prestataire
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ background: "#020617", color: "#fff", padding: "40px 20px", textAlign: "center" }}>
          <div className="syne" style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: 6 }}>
            Presta<span style={{ color: "#2563eb" }}>Connect</span>
          </div>
          <p style={{ color: "#475569", fontSize: 13, marginBottom: 20 }}>
            La première plateforme artisanale du Bénin
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            {[
              { val: "100% Béninois", label: "Pensé pour le marché local" },
              { val: "10+ Domaines", label: "De métiers artisanaux" },
              { val: "0% Commission", label: "Sur vos chantiers réalisés" },
            ].map((s) => (
              <div key={s.val}>
                <div className="syne" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2563eb" }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 20, fontSize: 12, color: "#334155",
            display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap",
          }}>
            <span>© 2026 PrestaConnect</span>
            <Link href="/contact" style={{ color: "#334155", textDecoration: "none" }}>Contact</Link>
            <Link href="/tarifs" style={{ color: "#334155", textDecoration: "none" }}>Tarifs</Link>
            <Link href="/solutions" style={{ color: "#334155", textDecoration: "none" }}>Solutions</Link>
          </div>
        </footer>
      </main>
    </>
  );
}