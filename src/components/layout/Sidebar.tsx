"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Calculator,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Pipeline", icon: Users },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/commissions", label: "Commissions", icon: Calculator },
  { href: "/payouts", label: "Payouts", icon: Wallet },
];

const adminItems = [
  { href: "/admin", label: "Admin", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { state, logout } = useApp();
  const isAdmin = state.currentUser?.role === "admin";

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-[#0f0f0f] border-r border-[#1e1e1e] flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-green-700 flex items-center justify-center glow-green-sm">
            <span className="text-white font-bold text-xs">B</span>
          </div>
          <div>
            <p className="text-white font-semibold text-sm tracking-wide">Bayaan</p>
            <p className="text-zinc-500 text-[10px] tracking-widest uppercase">Sales OS</p>
          </div>
        </div>
      </div>

      {/* User info */}
      {state.currentUser && (
        <div className="px-4 py-3 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-green-900/60 border border-green-800/50 flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 text-xs font-semibold">
                {state.currentUser.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {state.currentUser.full_name}
              </p>
              <p className="text-zinc-500 text-[10px] capitalize">
                {state.currentUser.role}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        <p className="px-3 py-1.5 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
          Main
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all group",
                active
                  ? "nav-item-active text-green-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
              )}
            >
              <Icon
                size={15}
                className={cn(
                  "flex-shrink-0",
                  active ? "text-green-400" : "text-zinc-500 group-hover:text-zinc-300"
                )}
              />
              <span className="font-medium">{label}</span>
              {active && (
                <ChevronRight size={12} className="ml-auto text-green-600" />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <p className="px-3 py-1.5 mt-3 text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
              Admin
            </p>
            {adminItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all group",
                    active
                      ? "nav-item-active text-green-400"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                  )}
                >
                  <Icon
                    size={15}
                    className={cn(
                      "flex-shrink-0",
                      active ? "text-green-400" : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span className="font-medium">{label}</span>
                  {active && (
                    <ChevronRight size={12} className="ml-auto text-green-600" />
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-[#1e1e1e]">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03] transition-all w-full group"
        >
          <LogOut size={15} className="flex-shrink-0 group-hover:text-zinc-300" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
