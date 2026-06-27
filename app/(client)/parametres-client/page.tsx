"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ParametresClientPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const handleChangePassword = async () => {
    setError("")
    setSuccess("")

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    if (err) {
      setError("Erreur : " + err.message)
    } else {
      setSuccess("Mot de passe mis à jour avec succès.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
    setLoading(false)
  }

  const handleDeleteAccount = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) return
    await supabase.auth.signOut()
    router.push("/")
  }

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box" as const,
    marginTop: "6px",
  }

  const sectionStyle = {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    padding: "24px",
    marginBottom: "20px",
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", marginBottom: "24px" }}>
        ⚙️ Paramètres
      </h1>

      {/* Changer mot de passe */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", marginBottom: "16px" }}>
          🔒 Changer le mot de passe
        </h2>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "14px", marginBottom: "16px" }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: "14px", marginBottom: "16px" }}>
            ✅ {success}
          </div>
        )}

        <div style={{ marginBottom: "14px" }}>
          <label style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8 caractères minimum"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          style={{ padding: "10px 24px", borderRadius: "10px", background: "#e63946", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Mise à jour..." : "Mettre à jour"}
        </button>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a", marginBottom: "16px" }}>
          🔔 Notifications
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b" }}>
          La gestion des notifications sera disponible prochainement.
        </p>
      </div>

      {/* Zone danger */}
      <div style={{ ...sectionStyle, border: "1px solid #fecaca" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#dc2626", marginBottom: "8px" }}>
          ⚠️ Zone de danger
        </h2>
        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
          La suppression de votre compte est irréversible et entraîne la perte de toutes vos données.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{ padding: "10px 24px", borderRadius: "10px", background: "white", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
        >
          Supprimer mon compte
        </button>
      </div>
    </div>
  )
}