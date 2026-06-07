"use client";
import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";

export default function ParametresPage() {
  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ), []);
  const [form, setForm] = useState({ full_name: "", email: "", telephone: "", ville: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setForm({ full_name: data.full_name || "", email: user.email || "", telephone: data.telephone || "", ville: data.ville || "" });
    }
    load();
  }, [supabase]);

  async function sauvegarder() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ full_name: form.full_name, telephone: form.telephone, ville: form.ville }).eq("id", user.id);
    setSuccess(true);
    setSaving(false);
    setTimeout(() => setSuccess(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Parametres</h1>
      <p className="text-sm text-gray-400 mb-8">Gerez votre profil</p>
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">Profil mis a jour !</div>}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Nom complet</label><input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
        <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Email</label><input value={form.email} disabled className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400" /></div>
        <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Telephone</label><input value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
        <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block">Ville</label><input value={form.ville} onChange={e => setForm({...form, ville: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" /></div>
        <button onClick={sauvegarder} disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">{saving ? "Enregistrement..." : "Enregistrer"}</button>
      </div>
    </div>
  );
}
