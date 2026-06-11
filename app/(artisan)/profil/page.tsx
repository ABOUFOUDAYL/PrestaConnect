'use client'

import { useState } from 'react'

const initialProfile = {
  nom: 'ISSA Sabirou',
  metier: 'Plombier',
  ville: 'Cotonou',
  telephone: '+229 97 00 00 00',
  description: 'Artisan plombier avec 10 ans d\'expérience. Intervention rapide et travail soigné.',
  tarif: '5000',
  disponible: true,
}

export default function ArtisanProfilPage() {
  const [profile, setProfile] = useState(initialProfile)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>Mon Profil</h1>
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          style={{
            padding: 'var(--space-2) var(--space-4)',
            background: editing ? 'var(--color-success-500)' : 'var(--color-primary-500)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          {editing ? 'Sauvegarder' : 'Modifier'}
        </button>
      </div>

      {saved && (
        <div style={{ background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', marginBottom: 'var(--space-4)', color: 'var(--color-success-700)' }}>
          ✅ Profil mis à jour avec succès
        </div>
      )}

      <div style={{ background: 'var(--color-white)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-gray-100)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            🔧
          </div>
          <div>
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)' }}>{profile.nom}</div>
            <div style={{ color: 'var(--color-gray-500)' }}>{profile.metier} · {profile.ville}</div>
            <div style={{ marginTop: 4 }}>
              <span style={{
                background: profile.disponible ? 'var(--color-success-100)' : 'var(--color-gray-100)',
                color: profile.disponible ? 'var(--color-success-700)' : 'var(--color-gray-500)',
                borderRadius: 'var(--radius-full)',
                padding: '2px 10px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 'var(--font-weight-medium)',
              }}>
                {profile.disponible ? '● Disponible' : '● Indisponible'}
              </span>
            </div>
          </div>
        </div>

        {[
          { label: 'Nom complet', key: 'nom' },
          { label: 'Métier', key: 'metier' },
          { label: 'Ville', key: 'ville' },
          { label: 'Téléphone', key: 'telephone' },
          { label: 'Tarif journalier (FCFA)', key: 'tarif' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', display: 'block', marginBottom: 4 }}>{label}</label>
            {editing ? (
              <input
                value={profile[key as keyof typeof profile] as string}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}
              />
            ) : (
              <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{profile[key as keyof typeof profile] as string}</div>
            )}
          </div>
        ))}

        <div>
          <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', display: 'block', marginBottom: 4 }}>Description</label>
          {editing ? (
            <textarea
              value={profile.description}
              onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', resize: 'vertical' }}
            />
          ) : (
            <div style={{ color: 'var(--color-gray-700)' }}>{profile.description}</div>
          )}
        </div>

        {editing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <label style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>Disponibilité</label>
            <input
              type="checkbox"
              checked={profile.disponible}
              onChange={e => setProfile(p => ({ ...p, disponible: e.target.checked }))}
            />
            <span style={{ fontSize: 'var(--font-size-sm)' }}>{profile.disponible ? 'Disponible' : 'Indisponible'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
