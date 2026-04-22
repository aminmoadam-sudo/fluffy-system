"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={cn(
          "w-full bg-[#161616] border border-[#252525] rounded-xl shadow-2xl",
          sizeStyles[size]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#1e1e1e]">
          <div>
            <h2 className="text-white font-semibold text-base">{title}</h2>
            {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors -mt-0.5 -mr-0.5"
          >
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
