"use client";

import Link from "next/link";

export default function MyEscrowsPage() {
  const escrows = [
    { id: "ESC123", amount: 500, status: "LOCKED" },
    { id: "ESC456", amount: 300, status: "RELEASED" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="flex justify-between items-center px-10 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Cudobe
        </Link>
        <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
          Dashboard
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">My Escrows</h1>

        <div className="border border-gray-200 rounded-2xl shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Escrow ID</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((escrow) => (
                <tr key={escrow.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <Link
                      href={`/escrow/${escrow.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {escrow.id}
                    </Link>
                  </td>
                  <td>${escrow.amount}</td>
                  <td>{escrow.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}