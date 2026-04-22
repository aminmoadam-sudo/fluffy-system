import { cn, formatCurrency } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  isCurrency?: boolean;
  accent?: "green" | "zinc" | "amber" | "red";
  className?: string;
}

const accentStyles = {
  green: {
    icon: "bg-green-900/40 text-green-400 border border-green-800/40",
    value: "text-green-400",
    glow: "glow-green-sm",
  },
  zinc: {
    icon: "bg-zinc-800/60 text-zinc-300 border border-zinc-700/40",
    value: "text-white",
    glow: "",
  },
  amber: {
    icon: "bg-amber-900/30 text-amber-400 border border-amber-800/30",
    value: "text-amber-400",
    glow: "",
  },
  red: {
    icon: "bg-red-900/30 text-red-400 border border-red-800/30",
    value: "text-red-400",
    glow: "",
  },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  isCurrency = false,
  accent = "zinc",
  className,
}: StatCardProps) {
  const styles = accentStyles[accent];
  const displayValue = isCurrency && typeof value === "number"
    ? formatCurrency(value)
    : value;

  return (
    <div
      className={cn(
        "bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 card-hover",
        accent === "green" && "border-green-900/30",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-lg", styles.icon)}>
          <Icon size={16} />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              trend.value >= 0
                ? "bg-green-900/30 text-green-400"
                : "bg-red-900/30 text-red-400"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        )}
      </div>
      <p className="text-zinc-500 text-xs mb-1">{label}</p>
      <p className={cn("text-2xl font-bold tracking-tight", styles.value)}>
        {displayValue}
      </p>
    </div>
  );
}
