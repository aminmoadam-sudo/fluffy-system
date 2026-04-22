"use client";
import { Bell } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { formatDate } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  const { state } = useApp();
  const today = formatDate(new Date().toISOString());

  return (
    <header className="h-14 border-b border-[#1e1e1e] bg-[#0a0a0a]/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <h1 className="text-white font-semibold text-base leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <span className="text-zinc-600 text-xs hidden md:block">{today}</span>
        <button className="relative p-1.5 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full status-dot-active" />
        </button>
        {state.currentUser && (
          <div className="w-7 h-7 rounded-full bg-green-900/60 border border-green-800/50 flex items-center justify-center">
            <span className="text-green-400 text-xs font-semibold">
              {state.currentUser.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
