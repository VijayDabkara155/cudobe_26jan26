"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      await Swal.fire({
        icon: "success",
        title: "Account Created! 🎉",
        text: "Your account has been created successfully. Please login to use our platform.",
        confirmButtonText: "Go to Login",
        confirmButtonColor: "#2563eb",
      });

      router.push("/login");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Create Account</h1>
        <p className="text-slate-500 text-center mb-8">Join Cudobe today.</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input name="firstName" placeholder="First Name" required onChange={handleChange}
              className="w-1/2 p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
            <input name="lastName" placeholder="Last Name" required onChange={handleChange}
              className="w-1/2 p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <input name="email" type="email" placeholder="Email Address" required onChange={handleChange}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />
          <input name="password" type="password" placeholder="Password (min 8 chars)" required minLength={8} onChange={handleChange}
            className="w-full p-3 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500" />

          <button type="submit" disabled={loading}
            className="w-full p-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg active:scale-95 disabled:opacity-60">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}