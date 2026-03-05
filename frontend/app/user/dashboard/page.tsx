"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    // 🔥 If Stripe redirected with success
    if (searchParams.get("payment") === "success") {
      Swal.fire({
        icon: "success",
        title: "Payment Successful",
        text: "Funds added to your wallet!",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      timer: 1200,
      showConfirmButton: false,
    });
    router.push("/login");
  };

  const handleAddFunds = async () => {
    const { value: amount } = await Swal.fire({
      title: "Add Funds",
      input: "number",
      inputLabel: "Enter amount (USD)",
      inputPlaceholder: "50",
      confirmButtonText: "Continue to Payment",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value || Number(value) <= 0) {
          return "Please enter a valid amount";
        }
      },
    });

    if (!amount) return;

    const res = await fetch("/api/stripe/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      Swal.fire("Error", "Unable to create Stripe session", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const allEscrows = [
    ...user.escrowsAsBuyer.map((e: any) => ({ ...e, role: "Buyer" })),
    ...user.escrowsAsSeller.map((e: any) => ({ ...e, role: "Seller" })),
  ];

  const totalEscrows = allEscrows.length;

  const active = allEscrows.filter(
    (e) => e.status === "LOCKED" || e.status === "FUNDED"
  ).length;

  const released = allEscrows.filter(
    (e) => e.status === "RELEASED"
  ).length;

  const disputed = allEscrows.filter(
    (e) => e.status === "DISPUTED"
  ).length;

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="flex justify-between items-center px-10 py-5 border-b">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Cudobe
        </Link>

        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="px-10 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {user.email}
          </p>
        </div>

        {/* Balance Card */}
        <div className="bg-[#0f172a] text-white rounded-2xl p-6 shadow-md mb-10 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-80">Available Balance</p>
            <h2 className="text-3xl font-bold mt-2">
              ${Number(user.balance || 0).toFixed(2)}
            </h2>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/transactions")}
              className="bg-white/10 text-white border border-white/20 px-5 py-2 rounded-lg font-medium hover:bg-white/20 transition"
            >
              Transaction History
            </button>
            <button
              onClick={handleAddFunds}
              className="bg-white text-black px-5 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              + Add Funds
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Escrows" value={String(totalEscrows)} />
          <StatCard title="Active" value={String(active)} />
          <StatCard title="Released" value={String(released)} />
          <StatCard title="Disputed" value={String(disputed)} />
        </div>

        {/* Escrow Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Escrows
            </h2>

            <button
              onClick={() => router.push("/escrow/create")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + Create Escrow
            </button>
          </div>

          <div className="overflow-x-auto">
            {allEscrows.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No escrows yet.
              </p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-3">Title</th>
                    <th>Role</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allEscrows.map((escrow: any) => (
                    <tr
                      key={escrow.id}
                      className="border-b hover:bg-gray-50 transition cursor-pointer"
                      onClick={() =>
                        router.push(`/escrow/${escrow.id}`)
                      }
                    >
                      <td className="py-3 font-medium text-gray-800">
                        {escrow.title}
                      </td>
                      <td>{escrow.role}</td>
                      <td>${Number(escrow.amount).toFixed(2)}</td>
                      <td>
                        <StatusBadge status={escrow.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">
        {value}
      </h3>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    PENDING: "bg-yellow-100 text-yellow-700",
    FUNDED: "bg-blue-100 text-blue-700",
    LOCKED: "bg-purple-100 text-purple-700",
    RELEASED: "bg-green-100 text-green-700",
    DISPUTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        colors[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}