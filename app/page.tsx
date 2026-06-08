"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Wallet, CheckCircle2, UserCheck, ShieldCheck, ArrowRight,
  Search, Star, Zap, Users, MapPin, Phone, ChevronDown,
  Wrench, Bolt, Hammer, Paintbrush, Waves, Flame, Wind, Home,
  Quote, TrendingUp, Award, Clock, Shield, BadgeCheck,
} from "lucide-react";

/* ─────────────────── DATA ─────────────────── */

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80",
  "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1400&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",
];

const MARQUEE_WORDS = [
  "Électricien", "Plombier", "Maçon", "Menuisier", "Peintre",
  "Carreleur", "Soudeur", "Climatisation", "Toiture", "Jardinage",
  "Plaquiste", "Couvreur", "Serrurier", "Chauffagiste",
];

const CATEGORIES = [
  { label: "Électricité", emoji: "⚡", color: "#FEF3C7", text: "#92400E", count: "42 artisans" },
  { label: "Plomberie", emoji: "🔧", color: "#DBEAFE", text: "#1E40AF", count: "38 artisans" },
  { label: "Maçonnerie", emoji: "🧱", color: "#FCE7F3", text: "#831843", count: "29 artisans" },
  { label: "Menuiserie", emoji: "🪵", color: "#DCFCE7", text: "#14532D", count: "25 artisans" },
  { label: "Peinture", emoji: "🖌️", color: "#F3E8FF", text: "#4C1D95", count: "31 artisans" },
  { label: "Carrelage", emoji: "🏠", color: "#FFEDD5", text: "#7C2D12", count: "18 artisans" },
  { label: "Soudure", emoji: "🔥", color: "#FEE2E2", text: "#7F1D1D", count: "14 artisans" },
  { label: "Climatisation", emoji: "❄️", color: "#E0F2FE", text: "#0C4A6E", count: "22 artisans" },
];

const PRESTATAIRES = [
  {
    name: "Kofi Mensah",
    metier: "Électricien certifié",
    ville: "Cotonou",
    note: 4.9,
    avis: 47,
    missions: 132,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    badge: "Top artisan",
    badgeColor: "#4F46E5",
  },
  {
    name: "Aïcha Bello",
    metier: "Plombier expert",
    ville: "Porto-Novo",
    note: 4.8,
    avis: 35,
    missions: 98,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
    badge: "Vérifié",
    badgeColor: "#059669",
  },
  {
    name: "Séverin Dohou",
    metier: "Maçon & carreleur",
    ville: "Parakou",
    note: 4.7,
    avis: 28,
    missions: 74,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80",
    badge: "Vérifié",
    badgeColor: "#059669",
  },
  {
    name: "Fatou Diallo",
    metier: "Peintre décorateur",
    ville: "Cotonou",
    note: 5.0,
    avis: 21,
    missions: 56,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
    badge: "Nouveau",
    badgeColor: "#D97706",
  },
];

const TEMOIGNAGES = [
  {
    nom: "Marie K.",
    role: "Cliente · Cotonou",
    texte: "J'ai trouvé un électricien en moins de 30 minutes. Il est venu le soir même, travail parfait. PrestaConnect change vraiment la vie !",
    note: 5,
    avatar: "MK",
    color: "#DBEAFE",
  },
  {
    nom: "Patrice A.",
    role: "Plombier · Porto-Novo",
    texte: "Depuis que je suis sur PrestaConnect, j'ai doublé mon nombre de chantiers. Le modèle sans abonnement est vraiment avantageux.",
    note: 5,
    avatar: "PA",
    color: "#DCFCE7",
  },
  {
    nom: "Sandra T.",
    role: "Cliente · Parakou",
    texte: "Profil vérifié, contact rapide, prix transparent. Exactement ce que je cherchais. Je recommande à toute ma famille.",
    note: 5,
    avatar: "ST",
    color: "#F3E8FF",
  },
];

const STATS = [
  { value: "2 400+", label: "Artisans inscrits", icon: "👷", color: "#4F46E5" },
  { value: "18 000+", label: "Missions réalisées", icon: "✅", color: "#059669" },
  { value: "12", label: "Villes couvertes", icon: "📍", color: "#D97706" },
  { value: "4.8/5", label: "Note moyenne", icon: "⭐", color: "#DC2626" },
];

/* ─────────────────── COMPOSANT ─────────────────── */

export default function HomePage() {
  const [currentImg, setCurrentImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"client" | "prestataire">("client");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const t = setInterval(() => setCurrentImg((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((v) => ({ ...v, [e.target.id]: true }));
      }),
      { threshold: 0.08 }
    );
    Object.values(refs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function addRef(id: string) {
    return (el: HTMLElement | null) => { refs.current[id] = el; };
  }

  function reveal(id: string, delay = "0ms") {
    return {
      opacity: visible[id] ? 1 : 0,
      transform: visible[id] ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.6s ease ${delay}, transform 0.6s ease ${delay}`,
    };
  }

  function renderStars(n: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < Math.floor(n) ? "#F59E0B" : "#E5E7EB", fontSize: 13 }}>★</span>
    ));
  }

  const searchHref = `/explore${searchQuery || searchVille ? `?q=${encodeURIComponent(searchQuery)}&ville=${encodeURIComponent(searchVille)}` : ""}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Inter', sans-serif; color: #0f172a; }
        .syne { font-family: 'Syne', sans-serif; }

        /* MARQUEE */
        .marquee-track { display: flex; gap: 40px; animation: marquee 25s linear infinite; white-space: nowrap; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* IMAGE SLIDE */
        .img-slide { position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%; transition: opacity 1.2s ease; }

        /* BUTTONS */
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px;
          padding: 13px 24px; border-radius: 12px; border: none; cursor: pointer;
          text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .btn-primary { background: #4F46E5; color: #fff; }
        .btn-primary:hover { background: #4338CA; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(79,70,229,0.35); }
        .btn-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.3); }
        .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); }
        .btn-green { background: #059669; color: #fff; }
        .btn-green:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(5,150,105,0.35); }
        .btn-white { background: #fff; color: #0f172a; }
        .btn-white:hover { background: #f8fafc; transform: translateY(-1px); }

        /* SEARCH */
        .search-box { background: #fff; border-radius: 16px; padding: 6px 6px 6px 20px;
          display: flex; align-items: center; gap: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        .search-input { border: none; outline: none; background: transparent;
          font-family: 'Inter', sans-serif; font-size: 15px; color: #0f172a; flex: 1; min-width: 0; padding: 8px 0; }
        .search-input::placeholder { color: #94a3b8; }
        .search-divider { width: 1px; height: 28px; background: #E5E7EB; flex-shrink: 0; }

        /* TABS */
        .tab-btn { padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 14px;
          cursor: pointer; border: 1.5px solid transparent; transition: all 0.2s;
          font-family: 'Syne', sans-serif; white-space: nowrap; }
        .tab-active-client { background: #4F46E5; color: #fff; }
        .tab-active-presta { background: #059669; color: #fff; }
        .tab-inactive { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65);
          border-color: rgba(255,255,255,0.15); }
        .tab-inactive:hover { background: rgba(255,255,255,0.15); color: #fff; }

        /* CARDS */
        .card { background: #fff; border-radius: 20px; border: 1px solid #F1F5F9;
          transition: transform 0.25s, box-shadow 0.25s; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
        .card-dark { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
          transition: transform 0.25s, background 0.25s; }
        .card-dark:hover { transform: translateY(-4px); background: rgba(255,255,255,0.07); }

        /* CATEGORY CARD */
        .cat-card { border-radius: 16px; padding: 20px 14px; text-align: center; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s; border: 1.5px solid transparent; }
        .cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: rgba(0,0,0,0.06); }

        /* PRESTA CARD */
        .presta-card { background: #fff; border-radius: 20px; border: 1px solid #F1F5F9;
          overflow: hidden; transition: transform 0.25s, box-shadow 0.25s; }
        .presta-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }

        /* TEMOIGNAGE */
        .temoignage-card { background: #fff; border-radius: 20px; border: 1px solid #F1F5F9; padding: 28px;
          transition: transform 0.25s, box-shadow 0.25s; }
        .temoignage-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.07); }

        /* BADGE */
        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
          border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }

        /* SECTION LABEL */
        .section-label { display: inline-flex; align-items: center; gap: 6px;
          background: #EEF2FF; color: #4F46E5; border-radius: 999px; padding: 5px 14px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 14px; }

        /* STAT CARD */
        .stat-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; padding: 28px 24px; text-align: center;
          transition: background 0.2s; }
        .stat-card:hover { background: rgba(255,255,255,0.08); }

        /* SCROLL INDICATOR */
        @keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }

        /* STEP NUMBER */
        .step-num { width: 48px; height: 48px; border-radius: 14px; background: #EEF2FF;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: #4F46E5; flex-shrink: 0; }

        /* RESPONSIVE */
        @media (max-width: 640px) {
          .search-box { flex-direction: column; padding: 12px; gap: 8px; border-radius: 16px; }
          .search-divider { display: none; }
          .search-input { width: 100%; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }
        }
      `}</style>

      <main style={{ overflowX: "hidden" }}>

        {/* ══════════════ HERO ══════════════ */}
        <section style={{
          position: "relative", minHeight: "100vh",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "#06091A", overflow: "hidden",
          paddingTop: "var(--navbar-height, 64px)",
        }}>
          {HERO_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="" className="img-slide"
              style={{ opacity: i === currentImg ? 0.3 : 0 }} />
          ))}
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(6,9,26,0.7) 0%, rgba(79,70,229,0.15) 50%, rgba(6,9,26,0.85) 100%)",
          }} />
          {/* Dot grid texture */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.12,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }} />

          <div style={{
            position: "relative", zIndex: 2, width: "100%",
            maxWidth: 860, margin: "0 auto",
            padding: "60px 20px 100px", textAlign: "center",
          }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(79,70,229,0.18)", border: "1px solid rgba(79,70,229,0.4)",
              color: "#A5B4FC", borderRadius: 999, padding: "6px 16px",
              fontSize: 12, fontWeight: 600, marginBottom: 28, letterSpacing: "0.05em",
            }}>
              🇧🇯 La première plateforme artisanale du Bénin
            </div>

            {/* Tabs client / prestataire */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
              <button className={`tab-btn ${activeTab === "client" ? "tab-active-client" : "tab-inactive"}`}
                onClick={() => setActiveTab("client")}>
                👤 Je cherche un artisan
              </button>
              <button className={`tab-btn ${activeTab === "prestataire" ? "tab-active-presta" : "tab-inactive"}`}
                onClick={() => setActiveTab("prestataire")}>
                🔨 Je suis artisan
              </button>
            </div>

            {/* Heading */}
            {activeTab === "client" ? (
              <div>
                <h1 className="syne" style={{
                  fontSize: "clamp(2.2rem, 7vw, 4.8rem)", fontWeight: 800,
                  color: "#fff", lineHeight: 1.1, marginBottom: 20,
                }}>
                  Trouvez l'artisan<br />
                  <span style={{
                    background: "linear-gradient(135deg, #818CF8, #6366F1)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>qu'il vous faut</span>
                  <br />en quelques clics
                </h1>
                <p style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", color: "#94A3B8", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.75 }}>
                  PrestaConnect connecte directement les particuliers avec les meilleurs professionnels locaux vérifiés.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="syne" style={{
                  fontSize: "clamp(2.2rem, 7vw, 4.8rem)", fontWeight: 800,
                  color: "#fff", lineHeight: 1.1, marginBottom: 20,
                }}>
                  Développez votre<br />
                  <span style={{
                    background: "linear-gradient(135deg, #34D399, #059669)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>activité au Bénin</span>
                  <br />sans commission
                </h1>
                <p style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", color: "#94A3B8", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.75 }}>
                  Recevez des missions qualifiées près de chez vous. Zéro abonnement mensuel, zéro commission sur vos chantiers.
                </p>
              </div>
            )}

            {/* Barre de recherche avancée */}
            {activeTab === "client" && (
              <div className="search-box" style={{ maxWidth: 660, margin: "0 auto 28px" }}>
                <Search size={20} color="#94A3B8" style={{ flexShrink: 0 }} />
                <input
                  className="search-input"
                  placeholder="Électricien, plombier, maçon…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (window.location.href = searchHref)}
                />
                <div className="search-divider" />
                <MapPin size={18} color="#94A3B8" style={{ flexShrink: 0, marginLeft: 12 }} />
                <input
                  className="search-input"
                  placeholder="Votre ville…"
                  value={searchVille}
                  onChange={(e) => setSearchVille(e.target.value)}
                  style={{ maxWidth: 160 }}
                />
                <Link href={searchHref} className="btn btn-primary" style={{ borderRadius: 10, padding: "12px 20px", fontSize: 14 }}>
                  Rechercher
                </Link>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {activeTab === "client" ? (
                <>
                  <Link href="/explore" className="btn btn-primary">
                    <Search size={17} /> Parcourir les artisans
                  </Link>
                  <Link href="/login" className="btn btn-outline">
                    Se connecter <ArrowRight size={17} />
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/register/provider" className="btn btn-green">
                    🔨 S'inscrire comme artisan <ArrowRight size={17} />
                  </Link>
                  <Link href="/tarifs" className="btn btn-outline">
                    Voir les tarifs
                  </Link>
                </>
              )}
            </div>

            {/* Mini stats */}
            <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
              {[
                { value: "2 400+", label: "Artisans" },
                { value: "12 villes", label: "Couvertes" },
                { value: "0%", label: "Commission" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div className="syne" style={{
                    fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800,
                    color: activeTab === "client" ? "#818CF8" : "#34D399",
                  }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
            animation: "bounce 2s infinite", color: "#fff", opacity: 0.3, fontSize: 22,
          }}>↓</div>
        </section>

        {/* ══════════════ MARQUEE ══════════════ */}
        <div style={{ background: "#4F46E5", padding: "14px 0", overflow: "hidden" }}>
          <div className="marquee-track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span key={i} className="syne" style={{
                fontSize: 13, fontWeight: 700, color: "#fff",
                letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 14,
              }}>
                {w} <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 18 }}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════ STATS ══════════════ */}
        <section style={{ background: "#06091A", padding: "64px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="stats" ref={addRef("stats")}
              style={{
                ...reveal("stats"),
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}>
              {STATS.map((s, i) => (
                <div key={s.label} className="stat-card"
                  style={{ ...reveal("stats", `${i * 80}ms`) }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                  <div className="syne" style={{ fontSize: "2.2rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ CATEGORIES ══════════════ */}
        <section style={{ background: "#F8FAFC", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="cats-title" ref={addRef("cats-title")}
              style={{ ...reveal("cats-title"), textAlign: "center", marginBottom: 44 }}>
              <span className="section-label">Catégories populaires</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800,
                color: "#0F172A", lineHeight: 1.2,
              }}>
                Tous les métiers,<br />
                <span style={{ color: "#4F46E5" }}>partout au Bénin</span>
              </h2>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 12,
            }}>
              {CATEGORIES.map((cat, i) => (
                <Link key={cat.label} href={`/explore?categorie=${encodeURIComponent(cat.label)}`}
                  style={{ textDecoration: "none" }}>
                  <div id={`cat-${i}`} ref={addRef(`cat-${i}`)} className="cat-card"
                    style={{ ...reveal(`cat-${i}`, `${i * 55}ms`), background: cat.color }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</div>
                    <div className="syne" style={{ fontWeight: 700, fontSize: 13, color: "#0F172A", marginBottom: 4 }}>
                      {cat.label}
                    </div>
                    <div style={{ fontSize: 11, color: cat.text, fontWeight: 600 }}>{cat.count}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Link href="/explore" className="btn" style={{
                background: "#EEF2FF", color: "#4F46E5",
                padding: "11px 24px", borderRadius: 12,
              }}>
                Voir toutes les catégories <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════ PRESTATAIRES EN VEDETTE ══════════════ */}
        <section style={{ background: "#fff", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="presta-title" ref={addRef("presta-title")}
              style={{ ...reveal("presta-title"), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="section-label">Artisans en vedette</span>
                <h2 className="syne" style={{
                  fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.2,
                }}>
                  Les meilleurs professionnels<br />
                  <span style={{ color: "#4F46E5" }}>près de chez vous</span>
                </h2>
              </div>
              <Link href="/explore" className="btn" style={{
                background: "#F8FAFC", color: "#0F172A", border: "1px solid #E2E8F0",
                padding: "10px 20px", borderRadius: 12, fontSize: 13,
              }}>
                Voir tous <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}>
              {PRESTATAIRES.map((p, i) => (
                <div key={p.name} id={`presta-${i}`} ref={addRef(`presta-${i}`)}
                  className="presta-card"
                  style={reveal(`presta-${i}`, `${i * 80}ms`)}>
                  {/* Header card */}
                  <div style={{
                    background: "linear-gradient(135deg, #06091A 0%, #1E1B4B 100%)",
                    padding: "24px 20px 20px", position: "relative",
                  }}>
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      background: p.badgeColor, color: "#fff",
                      borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700,
                    }}>
                      {p.badge}
                    </div>
                    <img src={p.avatar} alt={p.name}
                      style={{
                        width: 64, height: 64, borderRadius: "50%",
                        objectFit: "cover", border: "3px solid rgba(255,255,255,0.15)",
                        marginBottom: 12,
                      }} />
                    <div className="syne" style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{p.name}</div>
                    <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 3 }}>{p.metier}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                      <MapPin size={11} color="#64748B" />
                      <span style={{ fontSize: 11, color: "#64748B" }}>{p.ville}</span>
                    </div>
                  </div>
                  {/* Body card */}
                  <div style={{ padding: "16px 20px 20px" }}>
                    <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>{renderStars(p.note)}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                      <div style={{ textAlign: "center" }}>
                        <div className="syne" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A" }}>{p.note}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>{p.avis} avis</div>
                      </div>
                      <div style={{ width: 1, background: "#F1F5F9" }} />
                      <div style={{ textAlign: "center" }}>
                        <div className="syne" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A" }}>{p.missions}</div>
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>missions</div>
                      </div>
                      <div style={{ width: 1, background: "#F1F5F9" }} />
                      <div style={{ textAlign: "center" }}>
                        <BadgeCheck size={18} color="#4F46E5" style={{ margin: "0 auto 2px" }} />
                        <div style={{ fontSize: 10, color: "#94A3B8" }}>vérifié</div>
                      </div>
                    </div>
                    <Link href={`/prestataire/${encodeURIComponent(p.name.toLowerCase().replace(" ", "-"))}`}
                      className="btn btn-primary"
                      style={{ width: "100%", borderRadius: 10, padding: "11px 16px", fontSize: 13 }}>
                      Voir le profil
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ DOUBLE CTA (CLIENT / ARTISAN) ══════════════ */}
        <section style={{ background: "#F8FAFC", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="double-title" ref={addRef("double-title")}
              style={{ ...reveal("double-title"), textAlign: "center", marginBottom: 44 }}>
              <span className="section-label">Une plateforme, deux côtés</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800,
                color: "#0F172A", lineHeight: 1.25,
              }}>
                Que vous soyez client ou artisan,<br />
                <span style={{ color: "#4F46E5" }}>PrestaConnect est fait pour vous.</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {/* Carte Client */}
              <div id="cta-client" ref={addRef("cta-client")} className="card"
                style={{ ...reveal("cta-client"), background: "#EEF2FF", border: "1px solid #C7D2FE", padding: "32px 28px" }}>
                <div style={{
                  width: 52, height: 52, background: "#4F46E5", borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>
                  <Search size={24} color="#fff" />
                </div>
                <h3 className="syne" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>
                  Vous cherchez un artisan ?
                </h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, marginBottom: 20 }}>
                  Trouvez en quelques clics un professionnel vérifié près de chez vous. Réponse rapide, prix transparent.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 9 }}>
                  {["Prestataires vérifiés et certifiés", "Réponse en moins de 1h", "Zéro avance de frais", "Paiement après validation"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#312E81", fontWeight: 500 }}>
                      <CheckCircle2 size={15} color="#4F46E5" style={{ flexShrink: 0 }} /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/explore" className="btn btn-primary" style={{ width: "100%", borderRadius: 12 }}>
                  <Search size={16} /> Trouver un artisan
                </Link>
              </div>

              {/* Carte Prestataire */}
              <div id="cta-presta" ref={addRef("cta-presta")} className="card"
                style={{ ...reveal("cta-presta", "120ms"), background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "32px 28px" }}>
                <div style={{
                  width: 52, height: 52, background: "#059669", borderRadius: 14,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 18,
                }}>
                  <Hammer size={24} color="#fff" />
                </div>
                <h3 className="syne" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>
                  Vous êtes artisan ?
                </h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, marginBottom: 20 }}>
                  Recevez des missions qualifiées près de chez vous sans payer d'abonnement mensuel. Payez uniquement pour les contacts.
                </p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 9 }}>
                  {["Zéro abonnement mensuel", "Clients dans votre zone", "Paiement via Mobile Money", "Profil certifié visible"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#14532D", fontWeight: 500 }}>
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register/provider" className="btn btn-green" style={{ width: "100%", borderRadius: 12 }}>
                  S'inscrire comme artisan <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ COMMENT ÇA MARCHE ══════════════ */}
        <section style={{ background: "#fff", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="how-title" ref={addRef("how-title")}
              style={{ ...reveal("how-title"), textAlign: "center", marginBottom: 52 }}>
              <span className="section-label">Comment ça marche</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800,
                color: "#0F172A", lineHeight: 1.2,
              }}>
                Simple, rapide,{" "}
                <span style={{ color: "#4F46E5" }}>efficace.</span>
              </h2>
              <p style={{ color: "#64748B", maxWidth: 460, margin: "12px auto 0", fontSize: 14, lineHeight: 1.7 }}>
                Trouvez un artisan de confiance en 3 étapes simples.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {[
                {
                  num: "01", delay: "0ms",
                  title: "Décrivez votre besoin",
                  desc: "Indiquez le type de travaux et votre ville. Notre algorithme alerte les artisans qualifiés de votre zone.",
                  img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80",
                  icon: <Search size={18} color="#4F46E5" />,
                },
                {
                  num: "02", delay: "120ms",
                  title: "Choisissez votre artisan",
                  desc: "Comparez les profils, notes et avis vérifiés. Contactez directement l'artisan qui vous convient.",
                  img: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80",
                  icon: <Users size={18} color="#4F46E5" />,
                },
                {
                  num: "03", delay: "240ms",
                  title: "Travail fait, payez après",
                  desc: "L'artisan intervient, vous validez le travail. Zéro avance, zéro risque. 100% sécurisé.",
                  img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
                  icon: <CheckCircle2 size={18} color="#4F46E5" />,
                },
              ].map((step) => (
                <div key={step.num} id={`step-${step.num}`} ref={addRef(`step-${step.num}`)} className="card"
                  style={{ ...reveal(`step-${step.num}`, step.delay), overflow: "hidden" }}>
                  <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                    <img src={step.img} alt={step.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{
                      position: "absolute", top: 14, left: 14,
                      background: "#fff", color: "#4F46E5",
                      borderRadius: 10, width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                      <span className="syne" style={{ fontWeight: 800, fontSize: 13 }}>{step.num}</span>
                    </div>
                  </div>
                  <div style={{ padding: "20px 22px 24px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      background: "#EEF2FF", borderRadius: 10, width: 36, height: 36,
                      marginBottom: 12,
                    }}>{step.icon}</div>
                    <h3 className="syne" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ TARIFS ══════════════ */}
        <section style={{ background: "#06091A", padding: "80px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div id="tarifs-title" ref={addRef("tarifs-title")}
              style={{ ...reveal("tarifs-title"), textAlign: "center", marginBottom: 48 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(79,70,229,0.15)", color: "#A5B4FC",
                borderRadius: 999, padding: "5px 14px",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                marginBottom: 14,
              }}>Tarifs artisans</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: "#fff", lineHeight: 1.2,
              }}>
                Un modèle transparent,{" "}
                <span style={{ color: "#818CF8" }}>sans abonnement</span>
              </h2>
              <p style={{ color: "#475569", maxWidth: 480, margin: "12px auto 0", fontSize: 14, lineHeight: 1.75 }}>
                Payez uniquement pour les opportunités réelles. Pas de contrat, pas de prélèvement automatique.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 28 }}>
              {[
                {
                  icon: "⚡", label: "Cas urgent", price: "300", tag: "FCFA / contact",
                  desc: "Intervention rapide, besoin immédiat. Débloquez le contact du client en un seul clic.",
                  delay: "0ms",
                },
                {
                  icon: "🏗️", label: "Grand chantier", price: "1 500", tag: "FCFA / contact",
                  desc: "Travaux importants à forte valeur. Un seul chantier rentabilise des dizaines de contacts.",
                  delay: "120ms",
                },
              ].map((t) => (
                <div key={t.label} id={`tarif-${t.label}`} ref={addRef(`tarif-${t.label}`)} className="card-dark"
                  style={{ ...reveal(`tarif-${t.label}`, t.delay), padding: "28px 24px" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{
                    fontSize: 10, color: "#64748B", fontWeight: 700, marginBottom: 6,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>{t.label}</div>
                  <div className="syne" style={{ fontSize: "2.8rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {t.price}
                  </div>
                  <div style={{ color: "#818CF8", fontWeight: 600, marginBottom: 14, fontSize: 13 }}>{t.tag}</div>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75 }}>{t.desc}</p>
                </div>
              ))}
            </div>

            <div id="avantages" ref={addRef("avantages")}
              style={{
                ...reveal("avantages", "150ms"),
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 10,
              }}>
              {[
                { icon: <CheckCircle2 size={17} />, color: "#34D399", bg: "rgba(52,211,153,0.12)", title: "Zéro engagement", desc: "Pas de contrat, pas de prélèvement automatique." },
                { icon: <UserCheck size={17} />, color: "#818CF8", bg: "rgba(129,140,248,0.12)", title: "Clients qualifiés", desc: "Débloquez seulement les profils correspondant à votre métier." },
                { icon: <Wallet size={17} />, color: "#FCD34D", bg: "rgba(252,211,77,0.12)", title: "Mobile Money", desc: "Recharges via MTN ou Moov Money dès 500 FCFA." },
                { icon: <ShieldCheck size={17} />, color: "#F9A8D4", bg: "rgba(249,168,212,0.12)", title: "Rentabilité assurée", desc: "Un chantier suffit à rentabiliser des dizaines de contacts." },
              ].map((a) => (
                <div key={a.title} style={{
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "16px",
                  display: "flex", gap: 12, alignItems: "flex-start",
                }}>
                  <div style={{
                    color: a.color, flexShrink: 0, background: a.bg,
                    borderRadius: 9, padding: 8, display: "flex",
                  }}>{a.icon}</div>
                  <div>
                    <div className="syne" style={{ fontWeight: 700, color: "#E2E8F0", fontSize: 13, marginBottom: 3 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.65 }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 36 }}>
              <Link href="/tarifs" className="btn btn-outline" style={{ borderRadius: 12, fontSize: 14 }}>
                Voir tous les tarifs <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════ TÉMOIGNAGES ══════════════ */}
        <section style={{ background: "#fff", padding: "80px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="testi-title" ref={addRef("testi-title")}
              style={{ ...reveal("testi-title"), textAlign: "center", marginBottom: 48 }}>
              <span className="section-label">Témoignages</span>
              <h2 className="syne" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800,
                color: "#0F172A", lineHeight: 1.2,
              }}>
                Ils font confiance<br />
                <span style={{ color: "#4F46E5" }}>à PrestaConnect</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {TEMOIGNAGES.map((t, i) => (
                <div key={t.nom} id={`testi-${i}`} ref={addRef(`testi-${i}`)}
                  className="temoignage-card"
                  style={reveal(`testi-${i}`, `${i * 100}ms`)}>
                  <div style={{ color: "#C7D2FE", marginBottom: 14 }}>
                    <Quote size={28} />
                  </div>
                  <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, marginBottom: 20 }}>
                    "{t.texte}"
                  </p>
                  <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>{renderStars(t.note)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: t.color, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: "#334155",
                    }}>{t.avatar}</div>
                    <div>
                      <div className="syne" style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{t.nom}</div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ CTA FINAL ══════════════ */}
        <section style={{
          background: "linear-gradient(135deg, #06091A 0%, #1E1B4B 60%, #06091A 100%)",
          padding: "100px 20px", position: "relative", overflow: "hidden",
        }}>
          {/* Background decoration */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.06,
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />
          <div style={{
            position: "absolute", top: "-40%", left: "50%", transform: "translateX(-50%)",
            width: 600, height: 600,
            background: "radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)",
            borderRadius: "50%", pointerEvents: "none",
          }} />

          <div id="cta-final" ref={addRef("cta-final")}
            style={{ ...reveal("cta-final"), textAlign: "center", position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(129,140,248,0.15)", color: "#A5B4FC",
              borderRadius: 999, padding: "6px 16px",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 24,
            }}>
              🚀 Rejoignez la communauté
            </span>
            <h2 className="syne" style={{
              fontSize: "clamp(2rem, 5.5vw, 3.8rem)", fontWeight: 800, color: "#fff",
              lineHeight: 1.15, marginBottom: 18,
            }}>
              Prêt à rejoindre<br />
              <span style={{
                background: "linear-gradient(135deg, #818CF8, #6366F1)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>PrestaConnect ?</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, marginBottom: 40, lineHeight: 1.75, maxWidth: 460, margin: "0 auto 40px" }}>
              Des milliers de Béninois — clients et artisans — font déjà confiance à PrestaConnect pour leurs travaux du quotidien.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/explore" className="btn btn-primary" style={{ fontSize: 15, padding: "14px 28px", borderRadius: 12 }}>
                <Search size={18} /> Trouver un prestataire
              </Link>
              <Link href="/register/provider" className="btn btn-green" style={{ fontSize: 15, padding: "14px 28px", borderRadius: 12 }}>
                🔨 Devenir Prestataire
              </Link>
            </div>

            <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {[
                { icon: <Shield size={15} />, text: "Artisans vérifiés" },
                { icon: <Clock size={15} />, text: "Réponse < 1h" },
                { icon: <Star size={15} />, text: "4.8/5 de satisfaction" },
              ].map((item) => (
                <div key={item.text} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: 13, color: "#64748B",
                }}>
                  <span style={{ color: "#818CF8" }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{ background: "#020617", color: "#fff", padding: "56px 20px 28px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 32, marginBottom: 48,
            }}>
              {/* Logo + description */}
              <div style={{ gridColumn: "span 1" }}>
                <div className="syne" style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 10 }}>
                  Presta<span style={{ color: "#818CF8" }}>Connect</span>
                </div>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, marginBottom: 16, maxWidth: 220 }}>
                  La première plateforme artisanale du Bénin. Simple, rapide, local.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  {["fb", "ig", "wa"].map((s) => (
                    <div key={s} style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", fontSize: 13, color: "#64748B",
                    }}>{s === "fb" ? "f" : s === "ig" ? "ig" : "w"}</div>
                  ))}
                </div>
              </div>

              {/* Liens */}
              {[
                {
                  title: "Plateforme",
                  links: [
                    { label: "Explorer", href: "/explore" },
                    { label: "Catégories", href: "/explore" },
                    { label: "Prestataires vedette", href: "/explore" },
                    { label: "Comment ça marche", href: "/solutions" },
                  ],
                },
                {
                  title: "Artisans",
                  links: [
                    { label: "S'inscrire", href: "/register/provider" },
                    { label: "Tarifs", href: "/tarifs" },
                    { label: "Espace prestataire", href: "/prestataire" },
                    { label: "Recharger mon compte", href: "/recharge" },
                  ],
                },
                {
                  title: "Aide",
                  links: [
                    { label: "Contact", href: "/contact" },
                    { label: "À propos", href: "/about" },
                    { label: "Solutions", href: "/solutions" },
                    { label: "FAQ", href: "/about" },
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <div className="syne" style={{ fontWeight: 700, fontSize: 12, color: "#E2E8F0", marginBottom: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {col.title}
                  </div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} style={{ fontSize: 13, color: "#475569", textDecoration: "none", transition: "color 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#94A3B8")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#475569")}>
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Stats footer */}
            <div style={{
              display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center",
              padding: "24px 0", borderTop: "1px solid rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 24,
            }}>
              {[
                { val: "100% Béninois", label: "Pensé pour le marché local" },
                { val: "10+ Domaines", label: "De métiers artisanaux" },
                { val: "0% Commission", label: "Sur vos chantiers réalisés" },
              ].map((s) => (
                <div key={s.val} style={{ textAlign: "center" }}>
                  <div className="syne" style={{ fontSize: "1.15rem", fontWeight: 800, color: "#818CF8" }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: "#334155", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              flexWrap: "wrap", gap: 12, fontSize: 12, color: "#334155",
            }}>
              <span>© 2026 PrestaConnect · Tous droits réservés</span>
              <div style={{ display: "flex", gap: 16 }}>
                {["Mentions légales", "Confidentialité", "CGU"].map((l) => (
                  <Link key={l} href="#" style={{ color: "#334155", textDecoration: "none" }}>{l}</Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}