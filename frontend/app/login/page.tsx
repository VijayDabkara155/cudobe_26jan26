"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      await Swal.fire({
        icon: "success",
        title: "Welcome Back! 👋",
        text: "You have logged in successfully.",
        confirmButtonText: "Go to Dashboard",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        timerProgressBar: true,
      });

      router.push("/user/dashboard");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Welcome Back</h1>
        <p className="text-slate-500 text-center mb-8">Login to your Cudobe account.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email Address" required onChange={handleChange}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="password" type="password" placeholder="Password" required onChange={handleChange}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />

          <button type="submit" disabled={loading}
            className="w-full p-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg active:scale-95 disabled:opacity-60">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}