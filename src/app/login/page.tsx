"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { MOCK_TEAM_MEMBERS } from "@/lib/mock-data";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const success = login(email.trim());
    setLoading(false);
    if (success) {
      toast.success("Welcome back.");
      router.push("/dashboard");
    } else {
      toast.error("No account found with that email.");
    }
  };

  const demoAccounts = MOCK_TEAM_MEMBERS.filter((m) => m.is_active);

  const handleDemoLogin = async (memberEmail: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    login(memberEmail);
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0d0d0d] border-r border-[#1e1e1e] p-12 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-green-900/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center glow-green-sm">
              <span className="text-white font-bold text-base">B</span>
            </div>
            <div>
              <p className="text-white font-semibold text-lg tracking-wide">Bayaan Institute</p>
              <p className="text-zinc-500 text-xs tracking-widest uppercase">Sales OS</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <blockquote className="border-l-2 border-green-700 pl-5">
            <p className="text-zinc-300 text-xl font-light leading-relaxed">
              &ldquo;Complete visibility into every sale, every payment, and every commission — in one place.&rdquo;
            </p>
            <footer className="mt-4 text-zinc-500 text-sm">Internal Operations Platform</footer>
          </blockquote>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Cash Collected", value: "$28.5K" },
            { label: "Active Deals", value: "9" },
            { label: "This Month", value: "$10.3K" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#141414] border border-[#1e1e1e] rounded-lg p-3">
              <p className="text-green-400 font-bold text-xl">{stat.value}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <p className="text-white font-semibold">Bayaan Sales OS</p>
          </div>

          <div className="mb-8">
            <h2 className="text-white text-2xl font-bold tracking-tight">Sign in</h2>
            <p className="text-zinc-500 text-sm mt-1">Internal access only.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-zinc-400 text-xs font-medium mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bayaan.com"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 glow-green-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[#1e1e1e]" />
              <span className="text-zinc-600 text-xs">Demo accounts</span>
              <div className="flex-1 h-px bg-[#1e1e1e]" />
            </div>
            <div className="space-y-2">
              {demoAccounts.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleDemoLogin(member.email)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-3 py-2.5 bg-[#141414] hover:bg-[#1a1a1a] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-lg transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-full bg-green-900/50 border border-green-800/50 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 text-xs font-semibold">
                      {member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-200 text-sm font-medium truncate group-hover:text-white transition-colors">
                      {member.full_name}
                    </p>
                    <p className="text-zinc-600 text-xs truncate">{member.email}</p>
                  </div>
                  <span className="text-[10px] text-zinc-600 capitalize bg-zinc-800/60 px-2 py-0.5 rounded-full border border-zinc-700/40 flex-shrink-0">
                    {member.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
