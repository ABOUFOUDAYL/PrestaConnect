"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Phone, MapPin, Mail, Edit2, Save, X, FileText, Heart, MessageSquare } from "lucide-react"

const VILLES_BENIN = [
  "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Bohicon",
  "Natitingou", "Abomey", "Kandi", "Lokossa", "Ouidah", "Djougou",
  "Savalou", "Nikki", "Malanville", "Banikoara", "Tchaourou",
  "Dassa-Zoumé", "Comè", "Pobè", "Aplahoué", "Dogbo", "Sèmè-Podji",
]

export default function ProfilClientPage() {
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({ demandes: 0, favoris: 0, messages: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ prenom: "", nom: "", telephone: "", ville: "" })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle()

      if (prof) {
        setProfile({ ...prof, email: user.email })
        setForm({
          prenom: prof.prenom || "",
          nom: prof.nom || "",
          telephone: prof.telephone || "",
          ville: prof.ville || "",
        })
      }

      // Stats client
      const [demandesRes, favorisRes, messagesRes] = await Promise.all([
        supabase.from("demandes").select("*", { count: "exact", head: true }).eq("client_id", user.id),
        supabase.from("favoris").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("conversations").select("*", { count: "exact", head: true }).eq("client_id", user.id),
      ])

      setStats({
        demandes: demandesRes.count || 0,
        favoris: favorisRes.count || 0,
        messages: messagesRes.count || 0,
      })

      setIsLoading(false)
    }
    load()
  }, [])

  const formatPhone = (tel: string) => {
    if (!tel) return "Non renseigné"
    const clean = tel.replace(/\D/g, "")
    if (clean.startsWith("229") && clean.length >= 11) {
      return `+229 ${clean.slice(3, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)} ${clean.slice(9)}`
    }
    if (clean.length === 8) {
      return `+229 ${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6)}`
    }
    return tel
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        ville: form.ville,
      })
      .or(`user_id.eq.${user.id},id.eq.${user.id}`)

    if (!error) {
      setProfile((prev: any) => ({ ...prev, ...form }))
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #e63946", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  const initials = `${profile?.prenom?.[0] || ""}${profile?.nom?.[0] || ""}`.toUpperCase() || "?"

  const inputStyle = {
    width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0",
    borderRadius: "10px", fontSize: "14px", outline: "none",
    boxSizing: "border-box" as const,
  }

  const labelStyle = {
    fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px", fontWeight: 500,
  }

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: 0 }}>Mon profil</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "#e63946", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
          >
            <Edit2 size={16} /> Modifier
          </button>
        ) : (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setEditing(false)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "14px", color: "#64748b" }}
            >
              <X size={15} /> Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", borderRadius: "10px", background: "#e63946", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
            >
              <Save size={15} /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        )}
      </div>

      {success && (
        <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", marginBottom: "20px", fontSize: "14px" }}>
          ✅ Profil mis à jour avec succès
        </div>
      )}

      <div style={{ background: "linear-gradient(135deg, #e63946, #c1121f)", borderRadius: "20px", padding: "24px", marginBottom: "20px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 700, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 4px" }}>
              {profile?.prenom} {profile?.nom}
            </h2>
            <p style={{ fontSize: "13px", opacity: 0.85, margin: "0 0 6px" }}>Client PrestaConnect</p>
            {profile?.ville && (
              <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", opacity: 0.8 }}>
                <MapPin size={12} /> {profile.ville}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          {[
            { icon: <FileText size={16} />, label: "Demandes", value: stats.demandes },
            { icon: <Heart size={16} />, label: "Favoris", value: stats.favoris },
            { icon: <MessageSquare size={16} />, label: "Messages", value: stats.messages },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 2px" }}>{s.value}</p>
              <p style={{ fontSize: "11px", opacity: 0.8, margin: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                {s.icon} {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
        {editing ? (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", margin: "0 0 4px" }}>Modifier mes informations</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Prénom</label>
                <input type="text" value={form.prenom} onChange={(e) => setForm(f => ({ ...f, prenom: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nom</label>
                <input type="text" value={form.nom} onChange={(e) => setForm(f => ({ ...f, nom: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Téléphone (format: +229 XX XX XX XX)</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+229 97 00 00 00"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Ville</label>
              <input
                type="text"
                list="villes-profil"
                value={form.ville}
                onChange={(e) => setForm(f => ({ ...f, ville: e.target.value }))}
                placeholder="Ex: Cotonou"
                style={inputStyle}
              />
              <datalist id="villes-profil">
                {VILLES_BENIN.map(v => <option key={v} value={v} />)}
              </datalist>
            </div>
          </div>
        ) : (
          <div style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", margin: "0 0 20px", paddingBottom: "12px", borderBottom: "1px solid #f8fafc" }}>
              Informations personnelles
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {[
                { icon: <User size={16} />, label: "Nom complet", value: `${profile?.prenom || ""} ${profile?.nom || ""}`.trim() || "Non renseigné" },
                { icon: <Mail size={16} />, label: "Email", value: profile?.email || "Non renseigné" },
                { icon: <Phone size={16} />, label: "Téléphone", value: formatPhone(profile?.telephone) },
                { icon: <MapPin size={16} />, label: "Ville", value: profile?.ville || "Non renseignée" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#e63946", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 2px", fontWeight: 500 }}>{item.label}</p>
                    <p style={{ fontSize: "15px", color: "#0f172a", margin: 0, fontWeight: 500 }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}