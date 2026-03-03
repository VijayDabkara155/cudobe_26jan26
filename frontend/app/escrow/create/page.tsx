"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function CreateEscrowPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "USD",
    deadline: "",
    buyerEmail: "",
    sellerEmail: "",
    role: "Buyer",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/escrow/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create escrow");

      await Swal.fire({
        icon: "success",
        title: "Escrow Created! 🎉",
        text: "Your escrow has been created successfully.",
        confirmButtonText: "Go to Dashboard",
        confirmButtonColor: "#2563eb",
      });

      router.push("/user/dashboard");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="flex justify-between items-center px-10 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">Cudobe</Link>
        <div className="space-x-6">
          <Link href="/user/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="flex justify-center items-center px-6 py-16">
        <div className="w-full max-w-xl bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Create New Escrow</h1>
          <p className="text-center text-gray-500 text-sm mb-8">Fill in the details to create a secure escrow transaction.</p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Transaction Title</label>
              <input name="title" type="text" required onChange={handleChange}
                placeholder="e.g. Website Development Deal"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Amount + Currency */}
            <div className="flex gap-3">
              <div className="w-2/3">
                <label className="block mb-2 text-gray-700 font-medium">Amount</label>
                <input name="amount" type="number" required min="1" onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="w-1/3">
                <label className="block mb-2 text-gray-700 font-medium">Currency</label>
                <select name="currency" onChange={handleChange} value={form.currency}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="USD">USD</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>

            {/* Buyer Email */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Buyer Email</label>
              <input name="buyerEmail" type="email" required onChange={handleChange}
                placeholder="buyer@example.com"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Seller Email */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Seller Email</label>
              <input name="sellerEmail" type="email" required onChange={handleChange}
                placeholder="seller@example.com"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Your Role */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Your Role</label>
              <select name="role" onChange={handleChange} value={form.role}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Buyer">Buyer</option>
                <option value="Seller">Seller</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Deadline (optional)</label>
              <input name="deadline" type="date" onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Description */}
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Description (optional)</label>
              <textarea name="description" onChange={handleChange}
                placeholder="Describe the deal..."
                rows={4}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? "Creating..." : "Create Escrow"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}