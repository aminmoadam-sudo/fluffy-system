"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";

export default function RootPage() {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (state.currentUser) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [state.currentUser, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
