"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function EscrowDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        const res = await fetch(`/api/escrow/${id}`);
        if (!res.ok) {
          router.push("/user/dashboard");
          return;
        }
        const data = await res.json();
        setEscrow(data.escrow);
      } catch {
        router.push("/user/dashboard");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEscrow();
  }, [id]);

  const handleAction = async (action: string, label: string) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to ${label} this escrow.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${label}`,
    });

    if (!result.isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/escrow/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed");

      await Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Escrow has been ${label.toLowerCase()}ed successfully.`,
        confirmButtonColor: "#2563eb",
      });

      // Refresh escrow data
      const refreshRes = await fetch(`/api/escrow/${id}`);
      const refreshData = await refreshRes.json();
      setEscrow(refreshData.escrow);

    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: err.message, confirmButtonColor: "#2563eb" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!escrow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Escrow not found.</p>
      </div>
    );
  }

  const statusColors: any = {
    PENDING: "bg-yellow-100 text-yellow-700",
    FUNDED: "bg-blue-100 text-blue-700",
    LOCKED: "bg-purple-100 text-purple-700",
    RELEASED: "bg-green-100 text-green-700",
    DISPUTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  const timeline = [
    { status: "PENDING", label: "Created", done: true },
    { status: "FUNDED", label: "Funded", done: ["FUNDED", "LOCKED", "RELEASED"].includes(escrow.status) },
    { status: "LOCKED", label: "Locked", done: ["LOCKED", "RELEASED"].includes(escrow.status) },
    { status: "RELEASED", label: "Released", done: escrow.status === "RELEASED" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="flex justify-between items-center px-10 py-5 bg-white border-b">
        <Link href="/" className="text-2xl font-bold text-blue-600">Cudobe</Link>
        <Link href="/user/dashboard" className="text-gray-600 hover:text-blue-600 text-sm">
          ← Back to Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Title + Status */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{escrow.title}</h1>
            <p className="text-gray-400 text-sm mt-1">ID: {escrow.id}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[escrow.status]}`}>
            {escrow.status}
          </span>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction Timeline</h2>
          <div className="flex items-center justify-between">
            {timeline.map((step, index) => (
              <div key={step.status} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${step.done ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                    {step.done ? "✓" : index + 1}
                  </div>
                  <p className={`text-xs mt-1 ${step.done ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                    {step.label}
                  </p>
                </div>
                {index < timeline.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${step.done ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Escrow Details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Escrow Details</h2>
            <div className="space-y-3">
              <DetailRow label="Amount" value={`${Number(escrow.amount).toFixed(2)} ${escrow.currency}`} />
              <DetailRow label="Status" value={escrow.status} />
              <DetailRow label="Deadline" value={escrow.deadline ? new Date(escrow.deadline).toLocaleDateString() : "No deadline"} />
              <DetailRow label="Created" value={new Date(escrow.createdAt).toLocaleDateString()} />
              {escrow.description && <DetailRow label="Description" value={escrow.description} />}
            </div>
          </div>

          {/* People */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Parties Involved</h2>
            <div className="space-y-4">
              <PersonCard label="Buyer" person={escrow.buyer} color="blue" />
              <PersonCard label="Seller" person={escrow.seller} color="green" />
              <PersonCard label="Creator" person={escrow.creator} color="purple" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!["RELEASED", "CANCELLED"].includes(escrow.status) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {escrow.status === "PENDING" && (
                <button onClick={() => handleAction("FUND", "Fund")} disabled={actionLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                  💰 Fund Escrow
                </button>
              )}
              {["FUNDED", "LOCKED"].includes(escrow.status) && (
                <button onClick={() => handleAction("RELEASE", "Release")} disabled={actionLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-60">
                  ✅ Release Funds
                </button>
              )}
              {!["DISPUTED"].includes(escrow.status) && (
                <button onClick={() => handleAction("DISPUTE", "Dispute")} disabled={actionLoading}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-60">
                  ⚠️ Raise Dispute
                </button>
              )}
              {["PENDING", "FUNDED", "DISPUTED"].includes(escrow.status) && (
                <button onClick={() => handleAction("CANCEL", "Cancel")} disabled={actionLoading}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-60">
                  ✕ Cancel Escrow
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 text-sm font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function PersonCard({ label, person, color }: { label: string; person: any; color: string }) {
  const colors: any = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`px-2 py-1 rounded text-xs font-semibold ${colors[color]}`}>{label}</div>
      <div>
        <p className="text-gray-800 text-sm font-medium">{person.firstName} {person.lastName}</p>
        <p className="text-gray-400 text-xs">{person.email}</p>
      </div>
    </div>
  );
}