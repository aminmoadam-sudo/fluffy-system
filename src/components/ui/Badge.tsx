import { cn } from "@/lib/utils";

type BadgeVariant =
  | "green"
  | "zinc"
  | "amber"
  | "red"
  | "blue"
  | "purple"
  | "teal";

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-900/40 text-green-400 border-green-800/40",
  zinc: "bg-zinc-800/60 text-zinc-300 border-zinc-700/40",
  amber: "bg-amber-900/30 text-amber-400 border-amber-800/30",
  red: "bg-red-900/30 text-red-400 border-red-800/30",
  blue: "bg-blue-900/30 text-blue-400 border-blue-800/30",
  purple: "bg-purple-900/30 text-purple-400 border-purple-800/30",
  teal: "bg-teal-900/30 text-teal-400 border-teal-800/30",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

export default function Badge({
  children,
  variant = "zinc",
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border",
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            variant === "green" && "bg-green-400",
            variant === "amber" && "bg-amber-400",
            variant === "red" && "bg-red-400",
            variant === "blue" && "bg-blue-400",
            variant === "zinc" && "bg-zinc-400",
            variant === "purple" && "bg-purple-400",
            variant === "teal" && "bg-teal-400"
          )}
        />
      )}
      {children}
    </span>
  );
}

// Specific badge helpers
export function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    applied: { label: "Applied", variant: "zinc" },
    qualified: { label: "Qualified", variant: "blue" },
    contacted: { label: "Contacted", variant: "teal" },
    booked: { label: "Booked", variant: "purple" },
    no_show: { label: "No Show", variant: "amber" },
    closed_won: { label: "Closed Won", variant: "green" },
    closed_lost: { label: "Closed Lost", variant: "red" },
  };
  const config = map[stage] || { label: stage, variant: "zinc" as BadgeVariant };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

export function CommissionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: "Pending", variant: "amber" },
    approved: { label: "Approved", variant: "blue" },
    paid: { label: "Paid", variant: "green" },
  };
  const config = map[status] || { label: status, variant: "zinc" as BadgeVariant };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

export function DealStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    active: { label: "Active", variant: "blue" },
    completed: { label: "Completed", variant: "green" },
    overdue: { label: "Overdue", variant: "red" },
    cancelled: { label: "Cancelled", variant: "zinc" },
  };
  const config = map[status] || { label: status, variant: "zinc" as BadgeVariant };
  return <Badge variant={config.variant} dot>{config.label}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    admin: { label: "Admin", variant: "purple" },
    setter: { label: "Setter", variant: "teal" },
    closer: { label: "Closer", variant: "green" },
  };
  const config = map[role] || { label: role, variant: "zinc" as BadgeVariant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
