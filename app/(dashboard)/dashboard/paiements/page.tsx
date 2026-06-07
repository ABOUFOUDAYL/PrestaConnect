"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Transaction {
  id: string;
  created_at: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  description: string;
  type: "credit" | "debit";
}

export default function PaiementsPage() {
  const supabase = createClientComponentClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [solde, setSolde] = useState(0);
  const [retraits, setRetraits] = useState(0);
  const [montantRetrait, setMontantRetrait] = useState("");
  const [retraitLoading, setRetraitLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(data);
      const total = data
        .filter((t) => t.type === "credit" && t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalRetraits = data
        .filter((t) => t.type === "debit" && t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0);
      setSolde(total - totalRetraits);
      setRetraits(totalRetraits);
    }
    setLoading(false);
  }

  async function demanderRetrait() {
    const montant = parseFloat(montantRetrait);
    if (!montant || montant <= 0 || montant > solde) {
      setMessage({ type: "error", text: "Montant invalide ou insuffisant." });
      return;
    }
    setRetraitLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("transactions").insert({
      user_id: user?.id,
      amount: montant,
      type: "debit",
      status: "pending",
      description: "Demande de retrait",
    });
    if (error) {
      setMessage({ type: "error", text: "Erreur lors de la demande." });
    } else {
      setMessage({ type: "success", text: "Demande envoyée avec succès !" });
      setMontantRetrait("");
      fetchData();
    }
    setRetraitLoading(false);
    setTimeout(() => setMessage(null), 4000);
  }

  const statusLabel: Record<string, string> = {
    completed: "Complété",
    pending: "En attente",
    failed: "Échoué",
  };

  const statusColor: Record<string, string> = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Paiements</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Solde disponible</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {loading ? "…" : `${solde.toLocaleString()} FCFA`}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total reçu</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {loading ? "…" : `${(solde + retraits).toLocaleString()} FCFA`}
          </p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total retiré</p>
          <p className="text-3xl font-bold text-gray-700 mt-1">
            {loading ? "…" : `${retraits.toLocaleString()} FCFA`}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Demander un retrait</h2>
        {message && (
          <div className={`text-sm px-4 py-2 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Montant en FCFA"
            value={montantRetrait}
            onChange={(e) => setMontantRetrait(e.target.value)}
            className="flex-1 border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={demanderRetrait}
            disabled={retraitLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-xl transition disabled:opacity-50"
          >
            {retraitLoading ? "Envoi…" : "Retirer"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="text-lg font-semibold">Historique des transactions</h2>
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
                <th className="px-5 py-3 text-left">Type</th>
                <th className="px-5 py-3 text-right">Montant</th>
                <th className="px-5 py-3 text-left">Statut</th>
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
                    <span className={`text-xs font-medium ${t.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                      {t.type === "credit" ? "↑ Crédit" : "↓ Débit"}
                    </span>
                  </td>
                  <td className={`px-5 py-3 text-right font-semibold ${t.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                    {t.type === "credit" ? "+" : "-"}{t.amount.toLocaleString()} FCFA
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[t.status]}`}>
                      {statusLabel[t.status]}
                    </span>
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
