"use client";
import { useState } from "react";
import { Wallet, CheckCircle, Clock, TrendingUp, History, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import {
  buildSetterSummaries,
  buildCloserSummaries,
  calcTotalCommissionsOwed,
  calcTotalCommissionsPaid,
} from "@/lib/commission-engine";
import { useApp } from "@/contexts/AppContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PayoutsPage() {
  const { state, updateCommissionStatus, markCommissionsPaid } = useApp();
  const { teamMembers, payments, deals, commissions, payoutHistory, payoutPeriods, currentUser } = state;

  const [payoutModal, setPayoutModal] = useState<{ memberId: string; amount: number; name: string } | null>(null);
  const [payoutNotes, setPayoutNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"setters" | "closers" | "history">("setters");

  const setters = teamMembers.filter((m) => m.role === "setter" && m.is_active);
  const closers = teamMembers.filter((m) => m.role === "closer" && m.is_active);

  const setterSummaries = buildSetterSummaries(setters, payments, deals, commissions, payoutHistory);
  const closerSummaries = buildCloserSummaries(closers, payments, deals, commissions, payoutHistory);

  const totalOwed = calcTotalCommissionsOwed(commissions);
  const totalPaid = calcTotalCommissionsPaid(commissions);
  const setterOwed = commissions
    .filter((c) => {
      const m = teamMembers.find((tm) => tm.id === c.team_member_id);
      return m?.role === "setter" && (c.status === "pending" || c.status === "approved");
    })
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);
  const closerOwed = commissions
    .filter((c) => {
      const m = teamMembers.find((tm) => tm.id === c.team_member_id);
      return m?.role === "closer" && (c.status === "pending" || c.status === "approved");
    })
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));

  const handleApproveAll = (memberId: string) => {
    const pending = commissions.filter(
      (c) => c.team_member_id === memberId && c.status === "pending"
    );
    pending.forEach((c) => updateCommissionStatus(c.id, "approved"));
    toast.success(`${pending.length} commissions approved`);
  };

  const handleMarkPaid = () => {
    if (!payoutModal) return;
    const periodId = payoutPeriods[0]?.id || "pp-current";
    markCommissionsPaid(
      [payoutModal.memberId],
      periodId,
      payoutModal.amount,
      payoutNotes || "Payout processed"
    );
    setPayoutModal(null);
    setPayoutNotes("");
    toast.success(`${formatCurrency(payoutModal.amount)} marked as paid to ${payoutModal.name}`);
  };

  return (
    <div>
      <Header
        title="Payouts"
        subtitle="Team commission payout dashboard"
      />

      <div className="p-6 space-y-5">
        {/* Company summary */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Owed Now", value: totalOwed, color: "text-amber-400", icon: Wallet },
            { label: "Owed to Setters", value: setterOwed, color: "text-teal-400", icon: TrendingUp },
            { label: "Owed to Closers", value: closerOwed, color: "text-green-400", icon: TrendingUp },
            { label: "Total Paid (All Time)", value: totalPaid, color: "text-zinc-300", icon: CheckCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <p className="text-zinc-500 text-xs">{label}</p>
              </div>
              <p className={`font-bold text-xl ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-lg p-1 w-fit">
          {(["setters", "closers", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-green-800/40 text-green-300 border border-green-700/40"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Setter payouts */}
        {activeTab === "setters" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {setterSummaries.map(({ setter, biweekly_cash, biweekly_commission, catchup_cash, catchup_commission, total_paid_historically, total_unpaid }) => (
                <div key={setter.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-900/40 border border-teal-800/40 flex items-center justify-center">
                        <span className="text-teal-400 text-sm font-bold">
                          {setter.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">{setter.full_name}</p>
                        <RoleBadge role="setter" />
                      </div>
                    </div>
                    {currentUser?.role === "admin" && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApproveAll(setter.id)}
                        >
                          Approve All
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowRight}
                          onClick={() => setPayoutModal({ memberId: setter.id, amount: total_unpaid, name: setter.full_name })}
                          disabled={total_unpaid === 0}
                        >
                          Pay {formatCurrency(total_unpaid)}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                    <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                      <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Bi-Weekly Cash</p>
                      <p className="text-teal-400 font-bold text-lg">{formatCurrency(biweekly_cash)}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">last 14 days</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                      <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Bi-Weekly Commission</p>
                      <p className="text-teal-300 font-bold text-lg">{formatCurrency(biweekly_commission)}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">5% of cash</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                      <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Catch-Up Commission</p>
                      <p className="text-purple-400 font-bold text-lg">{formatCurrency(catchup_commission)}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">{formatCurrency(catchup_cash)} from old deals</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                      <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Total Unpaid</p>
                      <p className="text-amber-400 font-bold text-lg">{formatCurrency(total_unpaid)}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">{formatCurrency(total_paid_historically)} paid total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Closer payouts */}
        {activeTab === "closers" && (
          <div className="space-y-3">
            {closerSummaries.map(({ closer, monthly_cash, monthly_commission, total_paid_historically, total_unpaid }) => (
              <div key={closer.id} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-900/40 border border-green-800/40 flex items-center justify-center">
                      <span className="text-green-400 text-sm font-bold">
                        {closer.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{closer.full_name}</p>
                      <RoleBadge role="closer" />
                    </div>
                  </div>
                  {currentUser?.role === "admin" && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApproveAll(closer.id)}
                      >
                        Approve All
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => setPayoutModal({ memberId: closer.id, amount: total_unpaid, name: closer.full_name })}
                        disabled={total_unpaid === 0}
                      >
                        Pay {formatCurrency(total_unpaid)}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Monthly Cash</p>
                    <p className="text-green-400 font-bold text-lg">{formatCurrency(monthly_cash)}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">collected this month</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Monthly Commission</p>
                    <p className="text-green-300 font-bold text-lg">{formatCurrency(monthly_commission)}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">10% of cash</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                    <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Total Unpaid</p>
                    <p className="text-amber-400 font-bold text-lg">{formatCurrency(total_unpaid)}</p>
                    <p className="text-zinc-600 text-[10px] mt-0.5">{formatCurrency(total_paid_historically)} paid total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payout history */}
        {activeTab === "history" && (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e1e1e]">
              <h3 className="text-white font-semibold text-sm">Payout History</h3>
              <p className="text-zinc-500 text-xs mt-0.5">{payoutHistory.length} entries</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {["Date", "Team Member", "Role", "Amount", "Notes"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...payoutHistory]
                    .sort((a, b) => new Date(b.paid_at).getTime() - new Date(a.paid_at).getTime())
                    .map((ph) => {
                      const member = memberMap.get(ph.team_member_id);
                      return (
                        <tr key={ph.id} className="border-b border-[#1a1a1a] table-row-hover">
                          <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                            {formatDate(ph.paid_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-200 font-medium">
                            {member?.full_name || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {member && <RoleBadge role={member.role} />}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-green-400 font-semibold text-sm">
                              {formatCurrency(ph.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-zinc-500">
                            {ph.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {payoutHistory.length === 0 && (
                <div className="text-center py-12 text-zinc-600 text-sm">No payout history</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mark paid modal */}
      <Modal
        open={!!payoutModal}
        onClose={() => setPayoutModal(null)}
        title="Process Payout"
        subtitle={payoutModal ? `Marking approved commissions as paid for ${payoutModal.name}` : ""}
        size="sm"
      >
        {payoutModal && (
          <div className="space-y-4">
            <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4 text-center">
              <p className="text-zinc-400 text-xs mb-1">Payout amount</p>
              <p className="text-green-400 font-bold text-3xl">{formatCurrency(payoutModal.amount)}</p>
              <p className="text-zinc-600 text-xs mt-1">All approved commissions for {payoutModal.name}</p>
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Notes (optional)</label>
              <input
                className="input-field"
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="e.g. April bi-weekly payout"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" onClick={() => setPayoutModal(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleMarkPaid} className="flex-1">
                Confirm Payout
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
