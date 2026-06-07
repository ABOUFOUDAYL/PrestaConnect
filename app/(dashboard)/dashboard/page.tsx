// ─── DASHBOARD CLIENT ─────────────────────────────────────────────────────────
function DashboardClient({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<'prestataires' | 'annonces' | 'paiement'>('prestataires')
  const [prestataires, setPrestataires] = useState<any[]>([])
  const [annonces, setAnnonces] = useState<any[]>([])
  const [metierFilter, setMetierFilter] = useState<string>('tous')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ description: '', metier_requis: '', budget_estime: '' })
  const [submitting, setSubmitting] = useState(false)
  const firstName = profile?.full_name?.split(' ')[0] || profile?.prenom || 'vous'
  const villeClient = profile?.ville || ''

  useEffect(() => {
    if (activeTab === 'prestataires') fetchPrestataires()
    if (activeTab === 'annonces') fetchAnnonces()
  }, [activeTab])

  async function fetchPrestataires() {
    setLoading(true)
    let query = supabase
      .from('profiles')
      .select('id, full_name, metier_type, metier, ville, telephone, phone, note, status')
      .in('role', ['artisan', 'prestataire'])
      .eq('status', 'valide')
    if (villeClient) query = query.eq('ville', villeClient)
    const { data } = await query.order('note', { ascending: false })
    setPrestataires(data || [])
    setLoading(false)
  }

  async function fetchAnnonces() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('annonces')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
    setAnnonces(data || [])
    setLoading(false)
  }

  async function publierAnnonce() {
    if (!form.description || !form.metier_requis) return
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('annonces').insert({
      client_id: user.id,
      description: form.description,
      metier_requis: form.metier_requis,
      budget_estime: form.budget_estime ? Number(form.budget_estime) : null,
    })
    setForm({ description: '', metier_requis: '', budget_estime: '' })
    setShowForm(false)
    setSubmitting(false)
    fetchAnnonces()
  }

  // Grouper prestataires par metier_type
  const metiers = ['tous', ...Array.from(new Set(prestataires.map(p => p.metier_type || p.metier || 'Autre').filter(Boolean)))]
  const filtered = metierFilter === 'tous' ? prestataires : prestataires.filter(p => (p.metier_type || p.metier) === metierFilter)

  const metierEmoji: Record<string, string> = {
    'Electricien': '⚡', 'Plombier': '🔧', 'Maçon': '🧱', 'Peintre': '🎨',
    'Menuisier': '🪚', 'Carreleur': '🏠', 'Soudeur': '🔥', 'Chauffeur': '🚗',
    'Jardinage': '🌱', 'Nettoyage': '🧹', 'tous': '🔍',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 md:p-10">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">Espace client</p>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bonjour, {firstName} 👋</h1>
          <p className="text-gray-400 mt-1">
            {villeClient ? `Prestataires disponibles a ${villeClient}` : 'Trouvez le bon prestataire'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-100 p-1.5 rounded-2xl w-fit mb-8 shadow-sm gap-1">
          {[
            { key: 'prestataires', label: 'Prestataires', emoji: '👷' },
            { key: 'annonces', label: 'Mes annonces', emoji: '📢' },
            { key: 'paiement', label: 'Paiement', emoji: '💳' },
          ].map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === key ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>

        {/* ── PRESTATAIRES ── */}
        {activeTab === 'prestataires' && (
          <>
            {/* Filtre par metier */}
            <div className="flex gap-2 flex-wrap mb-6">
              {metiers.map(m => (
                <button
                  key={m}
                  onClick={() => setMetierFilter(m)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    metierFilter === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {metierEmoji[m] || '🛠'} {m === 'tous' ? 'Tous les metiers' : m}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 text-center text-gray-300 animate-pulse font-medium">Chargement...</div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(p => {
                  const tel = p.telephone || p.phone || ''
                  let waNum = tel.replace(/[\s\-\(\)]/g, '')
                  if (waNum.startsWith('0')) waNum = '229' + waNum.slice(1)
                  waNum = waNum.replace(/^\+/, '')
                  const waLink = tel ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Bonjour, j'ai trouve votre profil sur PrestaConnect. Etes-vous disponible ?`)}` : '#'

                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                            {p.full_name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{p.full_name}</p>
                            <p className="text-xs text-gray-400">{p.metier_type || p.metier || 'Prestataire'}</p>
                          </div>
                        </div>
                        {p.note && (
                          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-bold">
                            ⭐ {Number(p.note).toFixed(1)}
                          </div>
                        )}
                      </div>

                      {p.ville && (
                        <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                          📍 {p.ville}
                        </p>
                      )}

                      
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.534 5.859L.057 23.998l6.305-1.654A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.007-1.371l-.36-.214-3.733.979 1.001-3.651-.234-.374A9.818 9.818 0 1112 21.818z"/>
                        </svg>
                        Contacter sur WhatsApp
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-400 font-bold">Aucun prestataire disponible dans votre zone.</p>
                <p className="text-gray-300 text-sm mt-1">Publiez une annonce pour etre contacte.</p>
              </div>
            )}
          </>
        )}

        {/* ── ANNONCES ── */}
        {activeTab === 'annonces' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-xl text-gray-900">Mes annonces</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                + Nouvelle annonce
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-2xl border border-blue-100 p-6 mb-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Publier une annonce</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Metier requis</label>
                    <input
                      value={form.metier_requis}
                      onChange={e => setForm({ ...form, metier_requis: e.target.value })}
                      placeholder="Ex: Electricien, Plombier..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description du besoin</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Decrivez votre besoin en detail..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Budget estime (FCFA)</label>
                    <input
                      type="number"
                      value={form.budget_estime}
                      onChange={e => setForm({ ...form, budget_estime: e.target.value })}
                      placeholder="Ex: 50000"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <button
                    onClick={publierAnnonce}
                    disabled={submitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    {submitting ? 'Publication...' : 'Publier l annonce'}
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-20 text-center text-gray-300 animate-pulse">Chargement...</div>
            ) : annonces.length > 0 ? (
              <div className="space-y-4">
                {annonces.map(a => (
                  <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase">
                        {a.metier_requis || 'Service'}
                      </span>
                      {a.budget_estime && (
                        <span className="text-sm font-bold text-gray-500">{Number(a.budget_estime).toLocaleString()} FCFA</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{a.description}</p>
                    <p className="text-xs text-gray-300 mt-3">{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                <p className="text-4xl mb-3">📢</p>
                <p className="text-gray-400 font-bold">Aucune annonce publiee.</p>
                <p className="text-gray-300 text-sm mt-1">Publiez votre besoin pour etre contacte par des artisans.</p>
              </div>
            )}
          </div>
        )}

        {/* ── PAIEMENT ── */}
        {activeTab === 'paiement' && (
          <div className="max-w-lg">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
                💳
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">Paiement de service</h2>
              <p className="text-gray-400 text-sm mb-6">
                Ce service est disponible pour les metiers sans diplome formel. Payez directement votre prestataire via la plateforme.
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Information</p>
                <p className="text-sm text-amber-600">Le paiement en ligne est disponible uniquement pour les prestations de services sans certification requise.</p>
              </div>
              <Link
                href="/checkout"
                className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
              >
                Effectuer un paiement
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}