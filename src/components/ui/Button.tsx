import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-green-700 hover:bg-green-600 text-white border border-green-600/50 shadow-sm",
  secondary:
    "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
  ghost:
    "bg-transparent hover:bg-white/[0.04] text-zinc-400 hover:text-zinc-200 border border-transparent",
  danger:
    "bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/40",
  outline:
    "bg-transparent hover:bg-green-900/20 text-green-400 border border-green-800/60",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-md",
  md: "px-4 py-2 text-sm gap-2 rounded-lg",
  lg: "px-5 py-2.5 text-sm gap-2 rounded-lg",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  children?: React.ReactNode;
}

export default function Button({
  variant = "secondary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all cursor-pointer select-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 13 : 15} className="flex-shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight size={size === "sm" ? 13 : 15} className="flex-shrink-0" />
      )}
    </button>
  );
}
