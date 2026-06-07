"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface Transaction {
  id: string;
  created_at: string;
  montant: number;
  type_transaction: "recharge" | "deblocage";
  description: string;
  statut: string;
}

export default function PaiementsPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [solde, setSolde] = useState(0);
  const [montantCustom, setMontantCustom] = useState("");
  const [rechargeLoading, setRechargeLoading] = useState(false);

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
        .filter((t) => t.type_transaction === "recharge" && t.statut === "complete")
        .reduce((sum, t) => sum + t.montant, 0);
      const totalDeblocages = data
        .filter((t) => t.type_transaction === "deblocage" && t.statut === "complete")
        .reduce((sum, t) => sum + t.montant, 0);
      setSolde(totalRecharges - totalDeblocages);
    }
    setLoading(false);
  }

  async function lancerRecharge(montant: number) {
    if (montant < 500) return;
    setRechargeLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch("/api/fedapay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant,
          artisan_id: "recharge_directe",
          user_id: user.id,
        }),
      });
      const json = await res.json();
      if (json.payment_url) {
        window.location.href = json.payment_url;
      } else {
        alert("Erreur : " + (json.error || "Impossible d'initier le paiement"));
      }
    } catch (e) {
      alert("Erreur lors de l'initialisation du paiement.");
    }
    setRechargeLoading(false);
  }

  const montantCustomNum = parseInt(montantCustom);

  const statusColor: Record<string, string> = {
    complete: "bg-green-100 text-green-700",
    en_attente: "bg-yellow-100 text-yellow-700",
    echoue: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<string, string> = {
    complete: "Complété",
    en_attente: "En attente",
    echoue: "Échoué",
  };

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
          <p className="text-sm opacity-70 mt-2">500 FCFA = 1 déblocage de contact</p>
        </div>
        <div className="text-5xl opacity-20">💳</div>
      </div>

      {/* Recharge rapide */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recharge rapide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[500, 1000, 2000, 5000].map((montant) => (
            <button
              key={montant}
              onClick={() => lancerRecharge(montant)}
              disabled={rechargeLoading}
              className="rounded-xl border-2 border-blue-100 hover:border-blue-500 bg-white p-4 text-center transition disabled:opacity-50"
            >
              <p className="text-lg font-bold text-blue-600">{montant.toLocaleString()}</p>
              <p className="text-xs text-gray-500">FCFA</p>
              <p className="text-xs text-gray-400 mt-1">{montant / 500} déblocage{montant / 500 > 1 ? "s" : ""}</p>
            </button>
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
            disabled={!montantCustomNum || montantCustomNum < 500 || rechargeLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition disabled:opacity-50"
          >
            {rechargeLoading ? "Redirection…" : "Recharger"}
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
                <th className="px-5 py-3 text-left">Statut</th>
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
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[t.statut] || "bg-gray-100 text-gray-600"}`}>
                      {statusLabel[t.statut] || t.statut}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold ${t.type_transaction === "recharge" ? "text-green-600" : "text-red-500"}`}>
                    {t.type_transaction === "recharge" ? "+" : "-"}{t.montant.toLocaleString()} FCFA
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
