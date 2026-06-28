"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Facebook } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ nom: "", contact: "", sujet: "", message: "" })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }} className="px-4 pt-28 pb-16 text-center text-white">
        <h1 className="text-3xl sm:text-4xl font-black mb-3">Contactez-nous</h1>
        <p className="text-red-100 text-base max-w-xl mx-auto">
          Besoin d'aide ? Une question ? Notre équipe vous répond rapidement.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="space-y-4">

            {[
              { icon: <Phone size={20} />, title: "Téléphone / WhatsApp", value: "+229 01 40 27 89 43", sub: "Lun–Sam, 8h–18h", color: "#e63946", bg: "#fff1f2" },
              { icon: <Mail size={20} />, title: "Email", value: "sabirousayo@gmail.com", sub: "Réponse sous 24h", color: "#f97316", bg: "#fff7ed" },
              { icon: <MapPin size={20} />, title: "Adresse", value: "Parakou, Bénin", sub: "Siège social", color: "#16a34a", bg: "#f0fdf4" },
              { icon: <Clock size={20} />, title: "Horaires", value: "Lun – Sam", sub: "8h00 – 18h00", color: "#2563eb", bg: "#eff6ff" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{item.title}</p>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}

            <a href="https://wa.me/2290140278943" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-bold transition hover:opacity-90" style={{ background: '#25D366' }}>
              <MessageCircle size={18} /> Écrire sur WhatsApp
            </a>

            <a href="https://web.facebook.com/profile.php?id=61591381834280" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-white text-sm font-bold transition hover:opacity-90" style={{ background: '#1877F2' }}>
              <Facebook size={18} /> Suivez-nous sur Facebook
            </a>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: '#f0fdf4' }}>
                  <Send size={28} color="#16a34a" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Message envoyé ✅</h3>
                <p className="text-sm text-gray-500">Nous vous répondrons dans les plus brefs délais.</p>
                <button
                  onClick={() => { setSent(false); setForm({ nom: "", contact: "", sujet: "", message: "" }) }}
                  className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: '#e63946' }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Envoyer un message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nom complet *</label>
                      <input
                        type="text"
                        required
                        value={form.nom}
                        onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:border-red-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email ou WhatsApp *</label>
                      <input
                        type="text"
                        required
                        value={form.contact}
                        onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                        placeholder="+229 97 00 00 00"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Sujet *</label>
                    <select
                      required
                      value={form.sujet}
                      onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white"
                    >
                      <option value="">Choisir un sujet...</option>
                      <option>Problème technique</option>
                      <option>Inscription artisan</option>
                      <option>Réclamation</option>
                      <option>Partenariat</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Décrivez votre demande en détail..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #e63946, #c1121f)' }}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}