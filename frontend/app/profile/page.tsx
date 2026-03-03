"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
  const [name, setName] = useState("Vijay");
  const [email, setEmail] = useState("vijay@example.com");
  const [wallet, setWallet] = useState("0xA12...9BcF");

  const handleSave = () => {
    alert("Profile Updated (UI Only)");
  };

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

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="border border-gray-200 rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

          <div className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Wallet Address</label>
              <input
                className="w-full border rounded-lg px-4 py-2"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}