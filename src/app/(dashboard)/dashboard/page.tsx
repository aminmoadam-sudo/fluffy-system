"use client";
import {
  DollarSign,
  TrendingUp,
  Calculator,
  CheckCircle,
  Briefcase,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import Header from "@/components/layout/Header";
import StatCard from "@/components/ui/StatCard";
import { DealStatusBadge } from "@/components/ui/Badge";
import { useApp } from "@/contexts/AppContext";
import {
  calcTotalCashCollected,
  calcTotalExpectedRevenue,
  calcTotalCommissionsOwed,
  calcTotalCommissionsPaid,
  calcOverdueBalance,
  getMonthlyRevenue,
  getCashByMember,
} from "@/lib/commission-engine";
import { formatCurrency, formatDate, isCurrentMonth } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: {active?: boolean; payload?: {name: string; value: number; color: string}[]; label?: string}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c1c1c] border border-[#252525] rounded-lg p-3 shadow-2xl">
        <p className="text-zinc-400 text-xs mb-2">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-xs font-medium" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { state } = useApp();
  const { deals, payments, commissions, teamMembers, leads } = state;

  const totalCash = calcTotalCashCollected(payments);
  const totalExpected = calcTotalExpectedRevenue(deals);
  const totalOwed = calcTotalCommissionsOwed(commissions);
  const totalPaid = calcTotalCommissionsPaid(commissions);
  const overdueBalance = calcOverdueBalance(deals);
  const monthlyRevenue = getMonthlyRevenue(payments, deals);
  const activePlans = deals.filter((d) => d.payment_structure === "payment_plan" && d.status === "active").length;
  const dealsThisMonth = deals.filter((d) => isCurrentMonth(d.closed_at)).length;

  const setters = teamMembers.filter((m) => m.role === "setter");
  const closers = teamMembers.filter((m) => m.role === "closer");
  const cashByCloser = getCashByMember(payments, deals, closers, "closer");
  const cashBySetter = getCashByMember(payments, deals, setters, "setter");

  const recentDeals = [...deals]
    .sort((a, b) => new Date(b.closed_at).getTime() - new Date(a.closed_at).getTime())
    .slice(0, 5);

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Bayaan Institute — Sales & Commission Overview"
      />
      <div className="p-6 space-y-6">
        {/* Primary metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Cash Collected"
            value={totalCash}
            isCurrency
            icon={DollarSign}
            accent="green"
            trend={{ value: 18, label: "vs last month" }}
          />
          <StatCard
            label="Total Expected Revenue"
            value={totalExpected}
            isCurrency
            icon={TrendingUp}
            accent="zinc"
          />
          <StatCard
            label="Commissions Owed"
            value={totalOwed}
            isCurrency
            icon={Calculator}
            accent="amber"
          />
          <StatCard
            label="Commissions Paid"
            value={totalPaid}
            isCurrency
            icon={CheckCircle}
            accent="zinc"
          />
        </div>

        {/* Secondary metrics */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Deals Closed This Month"
            value={dealsThisMonth}
            icon={Briefcase}
            accent="zinc"
          />
          <StatCard
            label="Active Payment Plans"
            value={activePlans}
            icon={Clock}
            accent="zinc"
          />
          <StatCard
            label="Overdue Balance"
            value={overdueBalance}
            isCurrency
            icon={AlertTriangle}
            accent={overdueBalance > 0 ? "red" : "zinc"}
          />
          <StatCard
            label="Active Team Members"
            value={teamMembers.filter((m) => m.is_active).length}
            icon={Users}
            accent="zinc"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue chart — 2 cols */}
          <div className="xl:col-span-2 bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
            <div className="mb-5">
              <h3 className="text-white font-semibold text-sm">Revenue vs Cash Collected</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Monthly breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 12 }}
                />
                <Bar dataKey="revenue" name="Expected" fill="#1a472a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="collected" name="Collected" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Team performance — 1 col */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
            <div className="mb-5">
              <h3 className="text-white font-semibold text-sm">Cash by Closer</h3>
              <p className="text-zinc-500 text-xs mt-0.5">All time</p>
            </div>
            <div className="space-y-3">
              {cashByCloser.map((item, i) => {
                const pct = totalCash > 0 ? (item.amount / totalCash) * 100 : 0;
                return (
                  <div key={item.member_id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-300 font-medium">{item.member_name}</span>
                      <span className="text-zinc-500">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: i === 0
                            ? "linear-gradient(90deg, #15803d, #22c55e)"
                            : "linear-gradient(90deg, #14532d, #16a34a)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-[#1e1e1e]">
              <h3 className="text-white font-semibold text-sm mb-3">Cash by Setter</h3>
              <div className="space-y-3">
                {cashBySetter.map((item, i) => {
                  const pct = totalCash > 0 ? (item.amount / totalCash) * 100 : 0;
                  return (
                    <div key={item.member_id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-zinc-300 font-medium">{item.member_name}</span>
                        <span className="text-zinc-500">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: i === 0
                              ? "linear-gradient(90deg, #0d4728, #16a34a)"
                              : "linear-gradient(90deg, #0a3620, #15803d)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Recent deals */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl">
          <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-sm">Recent Deals</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Latest closed deals across the team</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {["Student", "Value", "Type", "Collected", "Closer", "Setter", "Date", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs text-zinc-500 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentDeals.map((deal) => {
                  const lead = leadMap.get(deal.lead_id);
                  const closer = memberMap.get(deal.closer_id);
                  const setter = memberMap.get(deal.setter_id);
                  return (
                    <tr key={deal.id} className="border-b border-[#1a1a1a] table-row-hover">
                      <td className="px-5 py-3 text-sm text-zinc-200">
                        {lead?.full_name || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-white font-medium">
                        {formatCurrency(deal.deal_value)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-zinc-400 capitalize">
                          {deal.payment_structure === "pif" ? "PIF" : "Plan"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-green-400 font-medium">
                          {formatCurrency(deal.total_collected)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-400">
                        {closer?.full_name || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-400">
                        {setter?.full_name || "—"}
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-500">
                        {formatDate(deal.closed_at)}
                      </td>
                      <td className="px-5 py-3">
                        <DealStatusBadge status={deal.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
