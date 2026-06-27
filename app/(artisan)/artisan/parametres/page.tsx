'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Briefcase, Lock, Save, Check } from 'lucide-react'

export default function ArtisanParametresPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Infos perso
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [quartier, setQuartier] = useState('')
  const [ville, setVille] = useState('')

  // Infos pro
  const [metier, setMetier] = useState('')
  const [categorieMetier, setCategorieMetier] = useState('')
  const [description, setDescription] = useState('')

  // Mot de passe
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [savingPerso, setSavingPerso] = useState(false)
  const [savingPro, setSavingPro] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savedPerso, setSavedPerso] = useState(false)
  const [savedPro, setSavedPro] = useState(false)
  const [savedPassword, setSavedPassword] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsLoading(false); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .single()

      const { data: presta } = await supabase
        .from('prestataires')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setNom(profile?.nom || presta?.nom || '')
      setPrenom(profile?.prenom || '')
      setTelephone(profile?.telephone || presta?.telephone || '')
      setQuartier(profile?.quartier || presta?.quartier || '')
      setVille(presta?.ville || '')
      setMetier(profile?.metier || presta?.metier || '')
      setCategorieMetier(presta?.categorie_metier || '')
      setDescription(profile?.description || presta?.description || '')

      setIsLoading(false)
    }
    load()
  }, [])

  const handleSavePerso = async () => {
    if (!userId) return
    setSavingPerso(true)
    setSavedPerso(false)

    await supabase
      .from('profiles')
      .update({ nom, prenom, telephone, quartier })
      .or(`user_id.eq.${userId},id.eq.${userId}`)

    await supabase
      .from('prestataires')
      .update({ nom, telephone, quartier })
      .eq('user_id', userId)

    setSavingPerso(false)
    setSavedPerso(true)
    setTimeout(() => setSavedPerso(false), 2500)
  }

  const handleSavePro = async () => {
    if (!userId) return
    setSavingPro(true)
    setSavedPro(false)

    await supabase
      .from('prestataires')
      .update({ metier, categorie_metier: categorieMetier, description, ville })
      .eq('user_id', userId)

    await supabase
      .from('profiles')
      .update({ metier, description })
      .or(`user_id.eq.${userId},id.eq.${userId}`)

    setSavingPro(false)
    setSavedPro(true)
    setTimeout(() => setSavedPro(false), 2500)
  }

  const handleSavePassword = async () => {
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas')
      return
    }

    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPassword(false)

    if (error) {
      setPasswordError(error.message)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    setSavedPassword(true)
    setTimeout(() => setSavedPassword(false), 2500)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid #e2e8f0', fontSize: '14px', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '12px', fontWeight: 600, color: '#475569',
    display: 'block', marginBottom: '6px',
  }

  const sectionStyle = {
    background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
    padding: '24px', marginBottom: '20px',
  }

  const saveButtonStyle = (disabled: boolean) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '10px', border: 'none',
    background: disabled ? '#cbd5e1' : 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white', fontSize: '13px', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #f97316', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ color: '#64748b', marginTop: '16px' }}>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Parametres</h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Gerez vos informations et votre securite</p>
      </div>

      {/* Infos perso */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="#f97316" /> Informations personnelles
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Prenom</label>
            <input value={prenom} onChange={(e) => setPrenom(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nom</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={labelStyle}>Telephone</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Quartier</label>
            <input value={quartier} onChange={(e) => setQuartier(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <button onClick={handleSavePerso} disabled={savingPerso} style={saveButtonStyle(savingPerso)}>
          {savedPerso ? <Check size={15} /> : <Save size={15} />}
          {savingPerso ? 'Enregistrement...' : savedPerso ? 'Enregistre' : 'Enregistrer'}
        </button>
      </div>

      {/* Infos pro */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={16} color="#f97316" /> Informations professionnelles
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Metier</label>
            <input value={metier} onChange={(e) => setMetier(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Categorie</label>
            <input value={categorieMetier} onChange={(e) => setCategorieMetier(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Ville</label>
          <input value={ville} onChange={(e) => setVille(e.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>

        <button onClick={handleSavePro} disabled={savingPro} style={saveButtonStyle(savingPro)}>
          {savedPro ? <Check size={15} /> : <Save size={15} />}
          {savingPro ? 'Enregistrement...' : savedPro ? 'Enregistre' : 'Enregistrer'}
        </button>
      </div>

      {/* Mot de passe */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={16} color="#f97316" /> Securite
        </h2>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Nouveau mot de passe</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Au moins 6 caracteres"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        {passwordError && (
          <p style={{ fontSize: '13px', color: '#dc2626', margin: '0 0 14px' }}>{passwordError}</p>
        )}

        <button
          onClick={handleSavePassword}
          disabled={savingPassword || !newPassword}
          style={saveButtonStyle(savingPassword || !newPassword)}
        >
          {savedPassword ? <Check size={15} /> : <Save size={15} />}
          {savingPassword ? 'Mise a jour...' : savedPassword ? 'Mot de passe modifie' : 'Changer le mot de passe'}
        </button>
      </div>
    </div>
  )
}