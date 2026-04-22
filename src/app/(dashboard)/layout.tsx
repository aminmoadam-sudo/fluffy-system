"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useApp } from "@/contexts/AppContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.currentUser) {
      router.replace("/login");
    }
  }, [state.currentUser, router]);

  if (!state.currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
