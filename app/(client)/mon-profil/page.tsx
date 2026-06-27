"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { User, Phone, MapPin, Mail, Edit2 } from "lucide-react"

export default function ProfilClientPage() {
  const [profile, setProfile] = useState<any>(null)
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
        .single()

      if (prof) {
        setProfile({ ...prof, email: user.email })
        setForm({
          prenom: prof.prenom || "",
          nom: prof.nom || "",
          telephone: prof.telephone || "",
          ville: prof.ville || "",
        })
      }
      setIsLoading(false)
    }
    load()
  }, [])

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

  const VILLES_BENIN = [
    "Cotonou", "Porto-Novo", "Parakou", "Abomey-Calavi", "Bohicon",
    "Natitingou", "Abomey", "Kandi", "Lokossa", "Ouidah", "Djougou",
    "Savalou", "Nikki", "Malanville", "Banikoara", "Tchaourou",
  ]

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #e63946", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", color: "var(--color-neutral-900)", margin: 0 }}>
          Mon profil
        </h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", background: "#e63946", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
          >
            <Edit2 size={16} /> Modifier
          </button>
        )}
      </div>

      {success && (
        <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", marginBottom: "24px", fontSize: "14px" }}>
          ✅ Profil mis à jour avec succès
        </div>
      )}

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", padding: "24px", background: "white", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 700, color: "#e63946" }}>
          {(profile?.prenom || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "18px", color: "#0f172a", margin: "0 0 4px" }}>
            {profile?.prenom} {profile?.nom}
          </p>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Client PrestaConnect</p>
        </div>
      </div>

      {/* Informations */}
      <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", overflow: "hidden" }}>

        {editing ? (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>Prénom</label>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm(f => ({ ...f, prenom: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>Nom</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm(f => ({ ...f, nom: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" as const }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>Téléphone</label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => setForm(f => ({ ...f, telephone: e.target.value }))}
                placeholder="+229 97 00 00 00"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" as const }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#64748b", display: "block", marginBottom: "6px" }}>Ville</label>
              <input
                type="text"
                list="villes-profil"
                value={form.ville}
                onChange={(e) => setForm(f => ({ ...f, ville: e.target.value }))}
                placeholder="Ex: Cotonou"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" as const }}
              />
              <datalist id="villes-profil">
                {VILLES_BENIN.map(v => <option key={v} value={v} />)}
              </datalist>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditing(false)}
                style={{ padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: "14px" }}
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: "10px 20px", borderRadius: "10px", background: "#e63946", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { icon: <User size={16} />, label: "Nom complet", value: `${profile?.prenom || ""} ${profile?.nom || ""}`.trim() || "Non renseigné" },
              { icon: <Mail size={16} />, label: "Email", value: profile?.email || "Non renseigné" },
              { icon: <Phone size={16} />, label: "Téléphone", value: profile?.telephone || "Non renseigné" },
              { icon: <MapPin size={16} />, label: "Ville", value: profile?.ville || "Non renseignée" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ color: "#e63946", marginTop: "2px" }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 2px" }}>{item.label}</p>
                  <p style={{ fontSize: "15px", color: "#0f172a", margin: 0, fontWeight: 500 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}