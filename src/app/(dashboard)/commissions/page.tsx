"use client";
import { useState, useMemo } from "react";
import { Check, DollarSign, Edit2, RefreshCw } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { CommissionStatusBadge, RoleBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  calcSetterBiweeklyPayout,
  calcSetterCatchupPayout,
  calcCloserMonthlyPayout,
  calcSetterBiweeklyCash,
  calcSetterCatchupCash,
  calcCloserMonthlyCash,
} from "@/lib/commission-engine";
import { useApp } from "@/contexts/AppContext";
import type { CommissionStatus } from "@/types";
import { formatCurrency, formatDate, SETTER_RATE, CLOSER_RATE } from "@/lib/utils";
import toast from "react-hot-toast";

export default function CommissionsPage() {
  const { state, updateCommissionStatus } = useApp();
  const { commissions, teamMembers, payments, deals } = state;

  const [filterStatus, setFilterStatus] = useState<CommissionStatus | "all">("all");
  const [filterRole, setFilterRole] = useState<"setter" | "closer" | "all">("all");
  const [overrideModal, setOverrideModal] = useState<string | null>(null);
  const [overrideAmount, setOverrideAmount] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const paymentMap = new Map(payments.map((p) => [p.id, p]));
  const dealMap = new Map(deals.map((d) => [d.id, d]));

  const filtered = useMemo(() => {
    let result = [...commissions];
    if (filterStatus !== "all") result = result.filter((c) => c.status === filterStatus);
    if (filterRole !== "all") result = result.filter((c) => c.role === filterRole);
    return result.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [commissions, filterStatus, filterRole]);

  const setters = teamMembers.filter((m) => m.role === "setter");
  const closers = teamMembers.filter((m) => m.role === "closer");

  // Calculator summaries
  const setterBiweekly = setters.map((s) => ({
    member: s,
    cash: calcSetterBiweeklyCash(s.id, payments, deals),
    commission: calcSetterBiweeklyPayout(s.id, payments, deals),
  }));

  const setterCatchup = setters.map((s) => ({
    member: s,
    cash: calcSetterCatchupCash(s.id, payments, deals),
    commission: calcSetterCatchupPayout(s.id, payments, deals),
  }));

  const closerMonthly = closers.map((c) => ({
    member: c,
    cash: calcCloserMonthlyCash(c.id, payments, deals),
    commission: calcCloserMonthlyPayout(c.id, payments, deals),
  }));

  const totalOwed = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);
  const totalPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);
  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + c.amount, 0);
  const totalApproved = commissions
    .filter((c) => c.status === "approved")
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);

  const overridingCommission = overrideModal ? commissions.find((c) => c.id === overrideModal) : null;

  const handleApproveAll = () => {
    const pending = filtered.filter((c) => c.status === "pending");
    pending.forEach((c) => updateCommissionStatus(c.id, "approved"));
    toast.success(`${pending.length} commissions approved`);
  };

  const handleOverride = () => {
    if (!overrideModal || !overrideAmount) return;
    const amount = parseFloat(overrideAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error("Invalid amount");
      return;
    }
    updateCommissionStatus(overrideModal, overridingCommission?.status || "pending", amount, overrideReason);
    setOverrideModal(null);
    setOverrideAmount("");
    setOverrideReason("");
    toast.success("Commission overridden");
  };

  return (
    <div>
      <Header
        title="Commissions"
        subtitle="Track, approve, and override commission records"
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Owed", value: totalOwed, color: "text-amber-400" },
            { label: "Pending Review", value: totalPending, color: "text-zinc-300" },
            { label: "Approved (unpaid)", value: totalApproved, color: "text-blue-400" },
            { label: "Total Paid", value: totalPaid, color: "text-green-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">{label}</p>
              <p className={`font-bold text-xl ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Calculator widgets */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Setter bi-weekly */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-teal-900/40 border border-teal-800/40 flex items-center justify-center">
                <DollarSign size={12} className="text-teal-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Setter Bi-Weekly</p>
                <p className="text-zinc-600 text-[10px]">Last 14 days · 5% rate</p>
              </div>
            </div>
            <div className="space-y-3">
              {setterBiweekly.map(({ member, cash, commission }) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                  <div>
                    <p className="text-zinc-300 text-xs font-medium">{member.full_name}</p>
                    <p className="text-zinc-600 text-[10px]">{formatCurrency(cash)} collected</p>
                  </div>
                  <p className="text-teal-400 font-bold text-sm">{formatCurrency(commission)}</p>
                </div>
              ))}
              <div className="pt-1 flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Total setter bi-weekly</span>
                <span className="text-teal-300 font-bold text-base">
                  {formatCurrency(setterBiweekly.reduce((s, i) => s + i.commission, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Setter catchup */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-purple-900/40 border border-purple-800/40 flex items-center justify-center">
                <RefreshCw size={12} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Setter Month-End Catch-Up</p>
                <p className="text-zinc-600 text-[10px]">Older deal installments this month</p>
              </div>
            </div>
            <div className="space-y-3">
              {setterCatchup.map(({ member, cash, commission }) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                  <div>
                    <p className="text-zinc-300 text-xs font-medium">{member.full_name}</p>
                    <p className="text-zinc-600 text-[10px]">{formatCurrency(cash)} from old deals</p>
                  </div>
                  <p className="text-purple-400 font-bold text-sm">{formatCurrency(commission)}</p>
                </div>
              ))}
              <div className="pt-1 flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Total catch-up</span>
                <span className="text-purple-300 font-bold text-base">
                  {formatCurrency(setterCatchup.reduce((s, i) => s + i.commission, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Closer monthly */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-green-900/40 border border-green-800/40 flex items-center justify-center">
                <DollarSign size={12} className="text-green-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Closer Monthly</p>
                <p className="text-zinc-600 text-[10px]">All cash collected this month · 10%</p>
              </div>
            </div>
            <div className="space-y-3">
              {closerMonthly.map(({ member, cash, commission }) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                  <div>
                    <p className="text-zinc-300 text-xs font-medium">{member.full_name}</p>
                    <p className="text-zinc-600 text-[10px]">{formatCurrency(cash)} collected this month</p>
                  </div>
                  <p className="text-green-400 font-bold text-sm">{formatCurrency(commission)}</p>
                </div>
              ))}
              <div className="pt-1 flex justify-between items-center">
                <span className="text-zinc-600 text-xs">Total closer monthly</span>
                <span className="text-green-300 font-bold text-base">
                  {formatCurrency(closerMonthly.reduce((s, i) => s + i.commission, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Commission table */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-white font-semibold text-sm">Commission Records</h3>
              <p className="text-zinc-500 text-xs mt-0.5">{filtered.length} records</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                className="select-field w-36"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as CommissionStatus | "all")}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
              <select
                className="select-field w-32"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as "setter" | "closer" | "all")}
              >
                <option value="all">All Roles</option>
                <option value="setter">Setters</option>
                <option value="closer">Closers</option>
              </select>
              {state.currentUser?.role === "admin" && (
                <Button variant="outline" size="sm" icon={Check} onClick={handleApproveAll}>
                  Approve All Pending
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {["Team Member", "Role", "Type", "Payment Amt", "Rate", "Commission", "Override", "Period", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((comm) => {
                  const member = memberMap.get(comm.team_member_id);
                  const payment = paymentMap.get(comm.payment_id);
                  const effectiveAmount = comm.override_amount ?? comm.amount;
                  return (
                    <tr key={comm.id} className="border-b border-[#1a1a1a] table-row-hover group">
                      <td className="px-4 py-3 text-sm text-zinc-200 font-medium">
                        {member?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <RoleBadge role={comm.role} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-zinc-400 capitalize">
                          {comm.commission_type === "biweekly" ? "Bi-weekly"
                            : comm.commission_type === "catchup" ? "Catch-up"
                            : "Monthly"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {payment ? formatCurrency(payment.amount) : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {(comm.rate * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-semibold text-sm">
                          {formatCurrency(effectiveAmount)}
                        </span>
                        {comm.override_amount !== null && (
                          <span className="text-zinc-600 text-xs ml-1 line-through">
                            {formatCurrency(comm.amount)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {comm.override_reason ? (
                          <span className="text-zinc-600 text-xs truncate max-w-[80px] block" title={comm.override_reason}>
                            {comm.override_reason}
                          </span>
                        ) : (
                          <span className="text-zinc-800 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 whitespace-nowrap">
                        {comm.pay_period_start ? formatDate(comm.pay_period_start) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <CommissionStatusBadge status={comm.status} />
                      </td>
                      <td className="px-4 py-3">
                        {state.currentUser?.role === "admin" && comm.status !== "paid" && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            {comm.status === "pending" && (
                              <button
                                onClick={() => { updateCommissionStatus(comm.id, "approved"); toast.success("Approved"); }}
                                className="p-1 rounded text-zinc-600 hover:text-green-400 transition-colors"
                                title="Approve"
                              >
                                <Check size={13} />
                              </button>
                            )}
                            <button
                              onClick={() => { setOverrideModal(comm.id); setOverrideAmount(String(comm.override_amount ?? comm.amount)); setOverrideReason(comm.override_reason || ""); }}
                              className="p-1 rounded text-zinc-600 hover:text-amber-400 transition-colors"
                              title="Override"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-zinc-600 text-sm">No commission records found</div>
            )}
          </div>
        </div>
      </div>

      {/* Override modal */}
      <Modal
        open={!!overrideModal}
        onClose={() => setOverrideModal(null)}
        title="Override Commission"
        subtitle="Manually adjust the commission amount for this record."
        size="sm"
      >
        <div className="space-y-4">
          {overridingCommission && (
            <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3 text-xs space-y-1">
              <p className="text-zinc-500">Original amount: <span className="text-white font-medium">{formatCurrency(overridingCommission.amount)}</span></p>
              <p className="text-zinc-500">Rate: <span className="text-white">{(overridingCommission.rate * 100).toFixed(0)}%</span></p>
            </div>
          )}
          <div>
            <label className="block text-zinc-500 text-xs mb-1">Override Amount ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              value={overrideAmount}
              onChange={(e) => setOverrideAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-zinc-500 text-xs mb-1">Reason</label>
            <input
              className="input-field"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Performance bonus, adjustment"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={() => setOverrideModal(null)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleOverride} className="flex-1">Apply Override</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
