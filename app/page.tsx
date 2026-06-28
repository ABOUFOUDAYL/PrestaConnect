"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowRight, Search, MapPin, CheckCircle2, Hammer,
  Quote, Clock, Shield, Star, BadgeCheck, Users,
} from "lucide-react";

/* ─────────────────── HOOKS SUPABASE ─────────────────── */

function useStats() {
  const [stats, setStats] = useState({ artisans: 0, missions: 0, villes: 0, noteMoyenne: 0 });

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: artisans },
        { count: missions },
        { data: villesData },
        { data: notesData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "prestataire"),
        supabase.from("missions").select("*", { count: "exact", head: true }).eq("statut", "terminée"),
        supabase.from("profiles").select("ville").eq("role", "prestataire"),
        supabase.from("avis").select("note"),
      ]);

      const villesUniques = new Set(villesData?.map((p) => p.ville)).size;
      const moyenne = notesData?.length
        ? (notesData.reduce((s, a) => s + a.note, 0) / notesData.length).toFixed(1)
        : "0.0";

      setStats({
        artisans: artisans ?? 0,
        missions: missions ?? 0,
        villes: villesUniques,
        noteMoyenne: Number(moyenne),
      });
    }
    fetchStats();
  }, []);

  return stats;
}

function useTopPrestataires() {
  const [prestataires, setPrestataires] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("profiles")
        .select("id, nom, metier, ville, avatar_url, missions_count, verifie, badge")
        .eq("role", "prestataire")
        .eq("verifie", true)
        .order("missions_count", { ascending: false })
        .limit(4);

      if (!data) return;

      const withNotes = await Promise.all(
        data.map(async (p) => {
          const { data: avis } = await supabase
            .from("avis")
            .select("note")
            .eq("prestataire_id", p.id);

          const note = avis?.length
            ? Number((avis.reduce((s, a) => s + a.note, 0) / avis.length).toFixed(1))
            : 0;

          return { ...p, note, avis: avis?.length ?? 0 };
        })
      );

      setPrestataires(withNotes);
    }
    fetch();
  }, []);

  return prestataires;
}

function useTemoignages() {
  const [temoignages, setTemoignages] = useState<any[]>([]);

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from("avis")
        .select(`
          id, texte, note, created_at,
          auteur:profiles!avis_client_id_fkey(nom, ville, role)
        `)
        .gte("note", 4)
        .not("texte", "is", null)
        .order("created_at", { ascending: false })
        .limit(2);

      setTemoignages(data ?? []);
    }
    fetch();
  }, []);

  return temoignages;
}

/* ─────────────────── DATA STATIQUE ─────────────────── */

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
  { label: "Électricité", emoji: "⚡", color: "#FEF3C7", text: "#92400E" },
  { label: "Plomberie", emoji: "🔧", color: "#FFE1E3", text: "#7A1D25" },
  { label: "Maçonnerie", emoji: "🧱", color: "#FCE7F3", text: "#831843" },
  { label: "Menuiserie", emoji: "🪵", color: "#DCFCE7", text: "#14532D" },
  { label: "Peinture", emoji: "🖌️", color: "#F3E8FF", text: "#4C1D95" },
  { label: "Carrelage", emoji: "🏠", color: "#FFEDD5", text: "#7C2D12" },
  { label: "Soudure", emoji: "🔥", color: "#FFC8CB", text: "#7A1D25" },
  { label: "Climatisation", emoji: "❄️", color: "#E0F2FE", text: "#0C4A6E" },
];

const AVATAR_COLORS = ["#FFC8CB", "#DCFCE7", "#F3E8FF", "#FFEDD5"];

/* ─────────────────── COMPOSANT PRINCIPAL ─────────────────── */

export default function HomePage() {
  const [currentImg, setCurrentImg] = useState(0);
  const [activeTab, setActiveTab] = useState<"client" | "prestataire">("client");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVille, setSearchVille] = useState("");
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<Record<string, HTMLElement | null>>({});

  const stats = useStats();
  const prestataires = useTopPrestataires();
  const temoignages = useTemoignages();

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

  function getInitiales(nom: string) {
    return nom?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "??";
  }

  const searchHref = `/explore${searchQuery || searchVille ? `?q=${encodeURIComponent(searchQuery)}&ville=${encodeURIComponent(searchVille)}` : ""}`;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; color: #0f172a; }
        .syne { font-family: 'Sora', sans-serif; }
        .marquee-track { display: flex; gap: 40px; animation: marquee 25s linear infinite; white-space: nowrap; }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .img-slide { position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%; transition: opacity 1.2s ease; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px; padding: 13px 24px; border-radius: 14px; border: none; cursor: pointer; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .btn-primary { background: #E63946; color: #fff; }
        .btn-primary:hover { background: #D32F2F; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(230,57,70,0.35); }
        .btn-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.3); }
        .btn-outline:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.6); }
        .btn-green { background: #059669; color: #fff; }
        .btn-green:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(5,150,105,0.35); }
        .search-box { background: #fff; border-radius: 18px; padding: 6px 6px 6px 20px; display: flex; align-items: center; gap: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.25); }
        .search-input { border: none; outline: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #0f172a; flex: 1; min-width: 0; padding: 8px 0; }
        .search-input::placeholder { color: #94a3b8; }
        .search-divider { width: 1px; height: 28px; background: #E5E7EB; flex-shrink: 0; }
        .tab-btn { padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; border: 1.5px solid transparent; transition: all 0.2s; font-family: 'Sora', sans-serif; white-space: nowrap; }
        .tab-active-client { background: #E63946; color: #fff; }
        .tab-active-presta { background: #059669; color: #fff; }
        .tab-inactive { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); border-color: rgba(255,255,255,0.15); }
        .tab-inactive:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .card { background: #fff; border-radius: 20px; border: 1px solid #F1F5F9; transition: transform 0.25s, box-shadow 0.25s; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
        .cat-card { border-radius: 16px; padding: 20px 14px; text-align: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; border: 1.5px solid transparent; }
        .cat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: rgba(0,0,0,0.06); }
        .presta-card { background: #fff; border-radius: 20px; border: 1px solid #F1F5F9; overflow: hidden; transition: transform 0.25s, box-shadow 0.25s; }
        .presta-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
        .temoignage-card { background: #fff; border-radius: 20px; border: 1px solid #F1F5F9; padding: 28px; transition: transform 0.25s, box-shadow 0.25s; }
        .temoignage-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.07); }
        .section-label { display: inline-flex; align-items: center; gap: 6px; background: #FFF1F2; color: #E63946; border-radius: 999px; padding: 5px 14px; font-size: 11px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; margin-bottom: 14px; }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        .skeleton-light { background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(8px); } }
        @media (max-width: 640px) {
          .search-box { flex-direction: column; padding: 12px; gap: 8px; border-radius: 16px; }
          .search-divider { display: none; }
          .search-input { width: 100%; border-bottom: 1px solid #F1F5F9; padding-bottom: 10px; }
        }
      `}</style>

      <main style={{ overflowX: "hidden" }}>

        {/* ══════════════ HERO (avec mini-stats intégrées) ══════════════ */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#06091A", overflow: "hidden", paddingTop: "var(--navbar-height, 64px)" }}>
          {HERO_IMAGES.map((src, i) => (
            <img key={i} src={src} alt="" className="img-slide" style={{ opacity: i === currentImg ? 0.3 : 0 }} />
          ))}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(6,9,26,0.7) 0%, rgba(230,57,70,0.15) 50%, rgba(6,9,26,0.85) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 860, margin: "0 auto", padding: "60px 20px 100px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(230,57,70,0.18)", border: "1px solid rgba(230,57,70,0.4)", color: "#FF9DA3", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 600, marginBottom: 28, letterSpacing: "0.05em" }}>
              🇧🇯 La première plateforme artisanale du Bénin
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
              <button className={`tab-btn ${activeTab === "client" ? "tab-active-client" : "tab-inactive"}`} onClick={() => setActiveTab("client")}>👤 Je cherche un artisan</button>
              <button className={`tab-btn ${activeTab === "prestataire" ? "tab-active-presta" : "tab-inactive"}`} onClick={() => setActiveTab("prestataire")}>🔨 Je suis artisan</button>
            </div>

            {activeTab === "client" ? (
              <div>
                <h1 className="syne" style={{ fontSize: "clamp(2.2rem, 7vw, 4.8rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
                  Trouvez l'artisan<br />
                  <span style={{ background: "linear-gradient(135deg, #FB6B72, #E63946)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>qu'il vous faut</span><br />en quelques clics
                </h1>
                <p style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", color: "#94A3B8", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.75 }}>
                  PrestaConnect connecte directement les particuliers avec les meilleurs professionnels locaux vérifiés.
                </p>
              </div>
            ) : (
              <div>
                <h1 className="syne" style={{ fontSize: "clamp(2.2rem, 7vw, 4.8rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
                  Développez votre<br />
                  <span style={{ background: "linear-gradient(135deg, #34D399, #059669)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>activité au Bénin</span><br />sans commission
                </h1>
                <p style={{ fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", color: "#94A3B8", maxWidth: 500, margin: "0 auto 36px", lineHeight: 1.75 }}>
                  Recevez des missions qualifiées près de chez vous. Zéro abonnement mensuel, zéro commission sur vos chantiers.
                </p>
              </div>
            )}

            {activeTab === "client" && (
              <div className="search-box" style={{ maxWidth: 660, margin: "0 auto 28px" }}>
                <Search size={20} color="#94A3B8" style={{ flexShrink: 0 }} />
                <input className="search-input" placeholder="Électricien, plombier, maçon…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (window.location.href = searchHref)} />
                <div className="search-divider" />
                <MapPin size={18} color="#94A3B8" style={{ flexShrink: 0, marginLeft: 12 }} />
                <input className="search-input" placeholder="Votre ville…" value={searchVille} onChange={(e) => setSearchVille(e.target.value)} style={{ maxWidth: 160 }} />
                <Link href={searchHref} className="btn btn-primary" style={{ borderRadius: 12, padding: "12px 20px", fontSize: 14 }}>Rechercher</Link>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {activeTab === "client" ? (
                <>
                  <Link href="/explore" className="btn btn-primary"><Search size={17} /> Parcourir les artisans</Link>
                  <Link href="/login" className="btn btn-outline">Se connecter <ArrowRight size={17} /></Link>
                </>
              ) : (
                <>
                  <Link href="/register/provider" className="btn btn-green">🔨 S'inscrire comme artisan <ArrowRight size={17} /></Link>
                  <Link href="/tarifs" className="btn btn-outline">Voir les tarifs</Link>
                </>
              )}
            </div>

            <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
              {[
                { value: stats.artisans > 0 ? `${stats.artisans}+` : "—", label: "Artisans" },
                { value: stats.villes > 0 ? `${stats.villes} villes` : "—", label: "Couvertes" },
                { value: stats.noteMoyenne > 0 ? `${stats.noteMoyenne}/5` : "—", label: "Note moyenne" },
                { value: "0%", label: "Commission" },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div className="syne" style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, color: activeTab === "client" ? "#FB6B72" : "#34D399" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", animation: "bounce 2s infinite", color: "#fff", opacity: 0.3, fontSize: 22 }}>↓</div>
        </section>

        {/* ══════════════ MARQUEE ══════════════ */}
        <div style={{ background: "#E63946", padding: "14px 0", overflow: "hidden" }}>
          <div className="marquee-track">
            {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
              <span key={i} className="syne" style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 14 }}>
                {w} <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 18 }}>·</span>
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════ CATEGORIES ══════════════ */}
        <section style={{ background: "#F8FAFC", padding: "64px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="cats-title" ref={addRef("cats-title")} style={{ ...reveal("cats-title"), textAlign: "center", marginBottom: 36 }}>
              <span className="section-label">Catégories populaires</span>
              <h2 className="syne" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                Tous les métiers, <span style={{ color: "#E63946" }}>partout au Bénin</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
              {CATEGORIES.map((cat, i) => (
                <Link key={cat.label} href={`/explore?categorie=${encodeURIComponent(cat.label)}`} style={{ textDecoration: "none" }}>
                  <div id={`cat-${i}`} ref={addRef(`cat-${i}`)} className="cat-card" style={{ ...reveal(`cat-${i}`, `${i * 55}ms`), background: cat.color }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.emoji}</div>
                    <div className="syne" style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{cat.label}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Link href="/explore" className="btn" style={{ background: "#FFF1F2", color: "#E63946", padding: "11px 24px", borderRadius: 12 }}>
                Voir toutes les catégories <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════ PRESTATAIRES EN VEDETTE ══════════════ */}
        <section style={{ background: "#fff", padding: "64px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="presta-title" ref={addRef("presta-title")} style={{ ...reveal("presta-title"), display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="section-label">Artisans en vedette</span>
                <h2 className="syne" style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                  Les meilleurs professionnels <span style={{ color: "#E63946" }}>près de chez vous</span>
                </h2>
              </div>
              <Link href="/explore" className="btn" style={{ background: "#F8FAFC", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 20px", borderRadius: 12, fontSize: 13 }}>
                Voir tous <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {prestataires.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="presta-card">
                      <div style={{ background: "linear-gradient(135deg, #06091A 0%, #450B10 100%)", padding: "24px 20px 20px" }}>
                        <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%", marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 16, width: "70%", marginBottom: 8 }} />
                        <div className="skeleton" style={{ height: 12, width: "50%" }} />
                      </div>
                      <div style={{ padding: "16px 20px 20px" }}>
                        <div className="skeleton-light" style={{ height: 12, width: "60%", marginBottom: 12 }} />
                        <div className="skeleton-light" style={{ height: 36, marginBottom: 12 }} />
                        <div className="skeleton-light" style={{ height: 40, borderRadius: 10 }} />
                      </div>
                    </div>
                  ))
                : prestataires.map((p, i) => (
                    <div key={p.id} id={`presta-${i}`} ref={addRef(`presta-${i}`)} className="presta-card" style={reveal(`presta-${i}`, `${i * 80}ms`)}>
                      <div style={{ background: "linear-gradient(135deg, #06091A 0%, #450B10 100%)", padding: "24px 20px 20px", position: "relative" }}>
                        <div style={{ position: "absolute", top: 12, right: 12, background: p.verifie ? "#059669" : "#D97706", color: "#fff", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 700 }}>
                          {p.verifie ? "Vérifié" : "Nouveau"}
                        </div>
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.nom} style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.15)", marginBottom: 12 }} />
                        ) : (
                          <div style={{ width: 64, height: 64, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#334155", marginBottom: 12, border: "3px solid rgba(255,255,255,0.15)" }}>
                            {getInitiales(p.nom)}
                          </div>
                        )}
                        <div className="syne" style={{ fontWeight: 700, color: "#fff", fontSize: "1rem" }}>{p.nom}</div>
                        <div style={{ color: "#94A3B8", fontSize: 12, marginTop: 3 }}>{p.metier}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                          <MapPin size={11} color="#64748B" />
                          <span style={{ fontSize: 11, color: "#64748B" }}>{p.ville}</span>
                        </div>
                      </div>
                      <div style={{ padding: "16px 20px 20px" }}>
                        <div style={{ display: "flex", gap: 0, marginBottom: 12 }}>{renderStars(p.note)}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                          <div style={{ textAlign: "center" }}>
                            <div className="syne" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A" }}>{p.note}</div>
                            <div style={{ fontSize: 10, color: "#94A3B8" }}>{p.avis} avis</div>
                          </div>
                          <div style={{ width: 1, background: "#F1F5F9" }} />
                          <div style={{ textAlign: "center" }}>
                            <div className="syne" style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0F172A" }}>{p.missions_count ?? 0}</div>
                            <div style={{ fontSize: 10, color: "#94A3B8" }}>missions</div>
                          </div>
                          <div style={{ width: 1, background: "#F1F5F9" }} />
                          <div style={{ textAlign: "center" }}>
                            <BadgeCheck size={18} color="#E63946" style={{ margin: "0 auto 2px" }} />
                            <div style={{ fontSize: 10, color: "#94A3B8" }}>vérifié</div>
                          </div>
                        </div>
                        <Link href={`/prestataire/${p.id}`} className="btn btn-primary" style={{ width: "100%", borderRadius: 12, padding: "11px 16px", fontSize: 13 }}>
                          Voir le profil
                        </Link>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ══════════════ DOUBLE CTA ══════════════ */}
        <section style={{ background: "#F8FAFC", padding: "64px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="double-title" ref={addRef("double-title")} style={{ ...reveal("double-title"), textAlign: "center", marginBottom: 36 }}>
              <span className="section-label">Une plateforme, deux côtés</span>
              <h2 className="syne" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.25 }}>
                Que vous soyez client ou artisan, <span style={{ color: "#E63946" }}>PrestaConnect est fait pour vous.</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              <div id="cta-client" ref={addRef("cta-client")} className="card" style={{ ...reveal("cta-client"), background: "#FFF1F2", border: "1px solid #FFC8CB", padding: "28px 26px" }}>
                <div style={{ width: 52, height: 52, background: "#E63946", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Search size={24} color="#fff" />
                </div>
                <h3 className="syne" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>Vous cherchez un artisan ?</h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, marginBottom: 18 }}>Trouvez en quelques clics un professionnel vérifié près de chez vous.</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Prestataires vérifiés", "Réponse en moins de 1h", "Zéro avance de frais"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#7A1D25", fontWeight: 500 }}>
                      <CheckCircle2 size={15} color="#E63946" style={{ flexShrink: 0 }} /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/explore" className="btn btn-primary" style={{ width: "100%", borderRadius: 14 }}><Search size={16} /> Trouver un artisan</Link>
              </div>

              <div id="cta-presta" ref={addRef("cta-presta")} className="card" style={{ ...reveal("cta-presta", "120ms"), background: "#F0FDF4", border: "1px solid #BBF7D0", padding: "28px 26px" }}>
                <div style={{ width: 52, height: 52, background: "#059669", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Hammer size={24} color="#fff" />
                </div>
                <h3 className="syne" style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>Vous êtes artisan ?</h3>
                <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.75, marginBottom: 18 }}>Recevez des missions qualifiées sans payer d'abonnement mensuel.</p>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                  {["Zéro abonnement mensuel", "Clients dans votre zone", "Paiement via Mobile Money"].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: "#14532D", fontWeight: 500 }}>
                      <CheckCircle2 size={15} color="#059669" style={{ flexShrink: 0 }} /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register/provider" className="btn btn-green" style={{ width: "100%", borderRadius: 14 }}>S'inscrire comme artisan <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ COMMENT ÇA MARCHE (version compacte) ══════════════ */}
        <section style={{ background: "#fff", padding: "64px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div id="how-title" ref={addRef("how-title")} style={{ ...reveal("how-title"), textAlign: "center", marginBottom: 36 }}>
              <span className="section-label">Comment ça marche</span>
              <h2 className="syne" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                Simple, rapide, <span style={{ color: "#E63946" }}>efficace.</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { num: "01", delay: "0ms", title: "Décrivez votre besoin", desc: "Indiquez le type de travaux et votre ville.", icon: <Search size={18} color="#E63946" /> },
                { num: "02", delay: "100ms", title: "Choisissez votre artisan", desc: "Comparez profils, notes et avis vérifiés.", icon: <Users size={18} color="#E63946" /> },
                { num: "03", delay: "200ms", title: "Travail fait, payez après", desc: "Vous validez, zéro avance, zéro risque.", icon: <CheckCircle2 size={18} color="#E63946" /> },
              ].map((step) => (
                <div key={step.num} id={`step-${step.num}`} ref={addRef(`step-${step.num}`)} className="card" style={{ ...reveal(`step-${step.num}`, step.delay), padding: "24px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#FFF1F2", borderRadius: 10, width: 36, height: 36 }}>{step.icon}</div>
                    <span className="syne" style={{ fontWeight: 800, fontSize: 13, color: "#E63946" }}>{step.num}</span>
                  </div>
                  <h3 className="syne" style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: "#64748B", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ TÉMOIGNAGES (réduit à 2) ══════════════ */}
        <section style={{ background: "#F8FAFC", padding: "64px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div id="testi-title" ref={addRef("testi-title")} style={{ ...reveal("testi-title"), textAlign: "center", marginBottom: 36 }}>
              <span className="section-label">Témoignages</span>
              <h2 className="syne" style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>
                Ils font confiance <span style={{ color: "#E63946" }}>à PrestaConnect</span>
              </h2>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {temoignages.length === 0
                ? Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="temoignage-card">
                      <div className="skeleton-light" style={{ height: 28, width: 28, marginBottom: 14, borderRadius: 6 }} />
                      <div className="skeleton-light" style={{ height: 14, marginBottom: 8 }} />
                      <div className="skeleton-light" style={{ height: 14, width: "80%", marginBottom: 20 }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="skeleton-light" style={{ width: 40, height: 40, borderRadius: "50%" }} />
                        <div style={{ flex: 1 }}>
                          <div className="skeleton-light" style={{ height: 13, width: "50%", marginBottom: 6 }} />
                        </div>
                      </div>
                    </div>
                  ))
                : temoignages.map((t, i) => (
                    <div key={t.id} id={`testi-${i}`} ref={addRef(`testi-${i}`)} className="temoignage-card" style={reveal(`testi-${i}`, `${i * 100}ms`)}>
                      <div style={{ color: "#FFC8CB", marginBottom: 14 }}><Quote size={28} /></div>
                      <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, marginBottom: 18 }}>"{t.texte}"</p>
                      <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>{renderStars(t.note)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#334155" }}>
                          {getInitiales(t.auteur?.nom ?? "?")}
                        </div>
                        <div>
                          <div className="syne" style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{t.auteur?.nom ?? "Utilisateur"}</div>
                          <div style={{ fontSize: 11, color: "#94A3B8" }}>{t.auteur?.role === "prestataire" ? "Artisan" : "Client"} · {t.auteur?.ville ?? ""}</div>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ══════════════ CTA FINAL (intègre les tarifs en bref) ══════════════ */}
        <section style={{ background: "linear-gradient(135deg, #06091A 0%, #450B10 60%, #06091A 100%)", padding: "80px 20px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div id="cta-final" ref={addRef("cta-final")} style={{ ...reveal("cta-final"), textAlign: "center", position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(251,107,114,0.15)", color: "#FF9DA3", borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 20 }}>
              🚀 Rejoignez la communauté
            </span>
            <h2 className="syne" style={{ fontSize: "clamp(2rem, 5.5vw, 3.8rem)", fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
              Prêt à rejoindre <span style={{ background: "linear-gradient(135deg, #FB6B72, #E63946)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PrestaConnect ?</span>
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.75, maxWidth: 460, margin: "0 auto 32px" }}>
              Pas d'abonnement pour les artisans : <strong style={{ color: "#fff" }}>300 FCFA</strong> pour un contact urgent, <strong style={{ color: "#fff" }}>1 500 FCFA</strong> pour un grand chantier.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/explore" className="btn btn-primary" style={{ fontSize: 15, padding: "14px 28px", borderRadius: 14 }}><Search size={18} /> Trouver un prestataire</Link>
              <Link href="/register/provider" className="btn btn-green" style={{ fontSize: 15, padding: "14px 28px", borderRadius: 14 }}>🔨 Devenir Prestataire</Link>
            </div>
            <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
              {[{ icon: <Shield size={15} />, text: "Artisans vérifiés" }, { icon: <Clock size={15} />, text: "Réponse < 1h" }, { icon: <Star size={15} />, text: `${stats.noteMoyenne > 0 ? stats.noteMoyenne : "4.8"}/5 de satisfaction` }].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "#64748B" }}>
                  <span style={{ color: "#FB6B72" }}>{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════ FOOTER ══════════════ */}
        <footer style={{ background: "#020617", color: "#fff", padding: "48px 20px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28, marginBottom: 36 }}>
              <div>
                <div className="syne" style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 10 }}>Presta<span style={{ color: "#FB6B72" }}>Connect</span></div>
                <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, maxWidth: 220 }}>La première plateforme artisanale du Bénin. Simple, rapide, local.</p>
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
                  <div className="syne" style={{ fontWeight: 700, fontSize: 12, color: "#E2E8F0", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>{col.title}</div>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link href={l.href} style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>{l.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#334155", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
              <span>© {new Date().getFullYear()} PrestaConnect Bénin · Tous droits réservés</span>
              <div style={{ display: "flex", gap: 16 }}>
                <Link href="/mentions-legales" style={{ color: "#334155", textDecoration: "none" }}>Mentions légales</Link>
                <Link href="/confidentialite" style={{ color: "#334155", textDecoration: "none" }}>Confidentialité</Link>
                <Link href="/cgu" style={{ color: "#334155", textDecoration: "none" }}>CGU</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}