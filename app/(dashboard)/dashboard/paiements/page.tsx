"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  type: "recharge" | "deblocage";
  description: string;
}

const FORFAITS = [
  { label: "Starter", amount: 500, deblocages: 1, color: "border-gray-200" },
  { label: "Standard", amount: 1000, deblocages: 3, color: "border-blue-400", popular: true },
  { label: "Pro", amount: 2500, deblocages: 8, color: "border-gray-200" },
];

export default function PaiementsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [solde, setSolde] = useState(0);
  const [montantCustom, setMontantCustom] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setTransactions(data);
      const totalRecharges = data
        .filter((t) => t.type === "recharge")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalDeblocages = data
        .filter((t) => t.type === "deblocage")
        .reduce((sum, t) => sum + t.amount, 0);
      setSolde(totalRecharges - totalDeblocages);
    }
    setLoading(false);
  }

  async function lancerRecharge(montant: number) {
    if (montant < 500) return;
    setRechargeLoading(montant);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch("/api/fedapay/initier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ montant, userId: user.id }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } catch (e) {
      alert("Erreur lors de l'initialisation du paiement.");
    }
    setRechargeLoading(null);
  }

  const montantCustomNum = parseInt(montantCustom);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Paiements</h1>

      {/* Solde */}
      <div className="rounded-2xl bg-blue-600 text-white p-6 flex items-center justify-between shadow-md">
        <div>
          <p className="text-sm opacity-80">Votre solde disponible</p>
          <p className="text-4xl font-bold mt-1">
            {loading ? "…" : `${solde.toLocaleString()} FCFA`}
          </p>
        </div>
        <div className="text-5xl opacity-20">💳</div>
      </div>

      {/* Forfaits */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Choisir un forfait</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FORFAITS.map((f) => (
            <div
              key={f.amount}
              className={`relative rounded-2xl border-2 ${f.color} bg-white p-5 shadow-sm flex flex-col gap-3`}
            >
              {f.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
              <div>
                <p className="font-bold text-lg">{f.label}</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{f.amount.toLocaleString()} FCFA</p>
                <p className="text-sm text-gray-500 mt-1">{f.deblocages} déblocage{f.deblocages > 1 ? "s" : ""} de contact</p>
              </div>
              <button
                onClick={() => lancerRecharge(f.amount)}
                disabled={rechargeLoading === f.amount}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-xl transition disabled:opacity-50"
              >
                {rechargeLoading === f.amount ? "Redirection…" : "Recharger"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Montant personnalisé */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Montant personnalisé</h2>
        <p className="text-sm text-gray-500">Minimum 500 FCFA</p>
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Ex: 1500"
            value={montantCustom}
            onChange={(e) => setMontantCustom(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => lancerRecharge(montantCustomNum)}
            disabled={!montantCustomNum || montantCustomNum < 500 || rechargeLoading === montantCustomNum}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition disabled:opacity-50"
          >
            {rechargeLoading === montantCustomNum ? "Redirection…" : "Recharger"}
          </button>
        </div>
      </div>

      {/* Historique */}
      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Historique</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement…</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucune transaction pour le moment.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left">Description</th>
                <th className="px-5 py-3 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3 text-gray-700">{t.description}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${t.type === "recharge" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "recharge" ? "+" : "-"}{t.amount.toLocaleString()} FCFA
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
