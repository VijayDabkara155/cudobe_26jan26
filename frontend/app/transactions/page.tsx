"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (type: string) => {
    setLoading(true);
    const res = await fetch(`/api/transactions?type=${type}`);

    if (!res.ok) {
      router.push("/login");
      return;
    }

    const data = await res.json();
    setTransactions(data.transactions);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions(filter);
  }, [filter]);

  return (
    <div className="min-h-screen bg-white px-10 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Transaction History</h1>

        <button
          onClick={() => router.push("/user/dashboard")}
          className="bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200"
        >
          Back
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {["ALL", "CREDIT", "DEBIT"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg border ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400">No transactions found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-3">Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tx.type === "CREDIT"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td>${Number(tx.amount).toFixed(2)}</td>
                  <td>{tx.status}</td>
                  <td>
                    {new Date(tx.createdAt).toLocaleString()}
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