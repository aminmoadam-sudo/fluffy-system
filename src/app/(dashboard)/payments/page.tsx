"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Trash2, TrendingUp } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import type { PaymentType } from "@/types";
import { formatCurrency, formatDate, isCurrentMonth, isWithinDays } from "@/lib/utils";
import toast from "react-hot-toast";

export default function PaymentsPage() {
  const { state, addPayment, deletePayment } = useApp();
  const { payments, deals, teamMembers, leads } = state;

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<PaymentType | "all">("all");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "this_month" | "last_14">("all");
  const [addOpen, setAddOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm] = useState({
    deal_id: "",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0],
    payment_type: "installment" as PaymentType,
    notes: "",
  });

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const dealMap = new Map(deals.map((d) => [d.id, d]));
  const leadMap = new Map(leads.map((l) => [l.id, l]));

  const enriched = useMemo(() => {
    return payments.map((p) => ({
      ...p,
      deal: dealMap.get(p.deal_id),
    }));
  }, [payments, dealMap]);

  const filtered = useMemo(() => {
    let result = [...enriched];
    if (filterType !== "all") result = result.filter((p) => p.payment_type === filterType);
    if (filterPeriod === "this_month") result = result.filter((p) => isCurrentMonth(p.payment_date));
    if (filterPeriod === "last_14") result = result.filter((p) => isWithinDays(p.payment_date, 14));
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const lead = p.deal ? leadMap.get(p.deal.lead_id) : null;
        return (
          lead?.full_name.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q) ||
          formatCurrency(p.amount).toLowerCase().includes(q)
        );
      });
    }
    return result.sort(
      (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
    );
  }, [enriched, filterType, filterPeriod, search, leadMap]);

  const totalFiltered = filtered.reduce((s, p) => s + p.amount, 0);
  const thisMonthTotal = enriched
    .filter((p) => isCurrentMonth(p.payment_date))
    .reduce((s, p) => s + p.amount, 0);
  const last14Total = enriched
    .filter((p) => isWithinDays(p.payment_date, 14))
    .reduce((s, p) => s + p.amount, 0);

  const handleAddPayment = () => {
    const amount = parseFloat(form.amount);
    if (!form.deal_id || isNaN(amount) || amount <= 0 || !form.payment_date) {
      toast.error("Please fill in all required fields");
      return;
    }
    addPayment({
      deal_id: form.deal_id,
      amount,
      payment_date: form.payment_date,
      payment_type: form.payment_type,
      notes: form.notes,
      recorded_by: state.currentUser?.id || "admin-001",
    });
    setForm({
      deal_id: "",
      amount: "",
      payment_date: new Date().toISOString().split("T")[0],
      payment_type: "installment",
      notes: "",
    });
    setAddOpen(false);
    toast.success("Payment recorded & commissions generated");
  };

  return (
    <div>
      <Header
        title="Payments"
        subtitle="Individual payment event tracking"
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
            Record Payment
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "This Month", value: thisMonthTotal, icon: TrendingUp },
            { label: "Last 14 Days", value: last14Total, icon: TrendingUp },
            { label: "Showing Total", value: totalFiltered, icon: TrendingUp },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">{label}</p>
              <p className="text-green-400 font-bold text-xl">{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search payments…"
              className="input-field pl-8 w-48"
            />
          </div>
          <select
            className="select-field w-40"
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as "all" | "this_month" | "last_14")}
          >
            <option value="all">All Time</option>
            <option value="this_month">This Month</option>
            <option value="last_14">Last 14 Days</option>
          </select>
          <select
            className="select-field w-36"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as PaymentType | "all")}
          >
            <option value="all">All Types</option>
            <option value="pif">PIF</option>
            <option value="installment">Installment</option>
            <option value="partial">Partial</option>
          </select>
          <span className="text-zinc-600 text-xs ml-auto">{filtered.length} payments</span>
        </div>

        {/* Table */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {["Date", "Student", "Amount", "Type", "Closer", "Setter", "Deal Type", "Notes", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((payment) => {
                  const deal = payment.deal;
                  const lead = deal ? leadMap.get(deal.lead_id) : null;
                  const closer = deal ? memberMap.get(deal.closer_id) : null;
                  const setter = deal ? memberMap.get(deal.setter_id) : null;
                  const dealCreated = deal ? new Date(deal.created_at) : null;
                  const paymentDate = new Date(payment.payment_date);
                  const isOldDeal = dealCreated
                    ? dealCreated < new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1)
                    : false;

                  return (
                    <tr key={payment.id} className="border-b border-[#1a1a1a] table-row-hover group">
                      <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                        {formatDate(payment.payment_date)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-zinc-200 text-sm font-medium">
                          {lead?.full_name || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-bold text-sm">
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          payment.payment_type === "pif"
                            ? "bg-green-900/30 text-green-400 border-green-800/30"
                            : payment.payment_type === "installment"
                            ? "bg-blue-900/30 text-blue-400 border-blue-800/30"
                            : "bg-amber-900/30 text-amber-400 border-amber-800/30"
                        }`}>
                          {payment.payment_type === "pif" ? "PIF" : payment.payment_type === "installment" ? "Installment" : "Partial"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {closer?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {setter?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {deal && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isOldDeal
                              ? "bg-purple-900/30 text-purple-400"
                              : "bg-zinc-800/60 text-zinc-400"
                          }`}>
                            {isOldDeal ? "Previous deal" : "Current deal"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-600 max-w-[120px] truncate">
                        {payment.notes || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {state.currentUser?.role === "admin" && (
                          <button
                            onClick={() => setConfirmDelete(payment.id)}
                            className="p-1 rounded text-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-zinc-600 text-sm">
                No payments found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Record payment modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Record Payment"
        subtitle="Log a payment received. Commissions will be auto-calculated."
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Deal *</label>
              <select
                className="select-field"
                value={form.deal_id}
                onChange={(e) => setForm((f) => ({ ...f, deal_id: e.target.value }))}
              >
                <option value="">Select deal</option>
                {deals
                  .filter((d) => d.status !== "completed" && d.status !== "cancelled")
                  .map((d) => {
                    const lead = leadMap.get(d.lead_id);
                    const closer = memberMap.get(d.closer_id);
                    return (
                      <option key={d.id} value={d.id}>
                        {lead?.full_name || "Student"} — {formatCurrency(d.remaining_balance)} remaining ({closer?.full_name})
                      </option>
                    );
                  })}
              </select>
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Amount ($) *</label>
              <input
                type="number"
                min="0"
                step="50"
                className="input-field"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Payment Date *</label>
              <input
                type="date"
                className="input-field"
                value={form.payment_date}
                onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Payment Type *</label>
              <select
                className="select-field"
                value={form.payment_type}
                onChange={(e) => setForm((f) => ({ ...f, payment_type: e.target.value as PaymentType }))}
              >
                <option value="pif">Paid in Full</option>
                <option value="installment">Installment</option>
                <option value="partial">Partial</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Notes</label>
              <input
                className="input-field"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Month 3 installment"
              />
            </div>
          </div>
          {form.deal_id && form.amount && (
            <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-3 text-xs">
              <p className="text-green-400 font-medium mb-1">Commission preview</p>
              <p className="text-zinc-400">
                Closer: <span className="text-white font-medium">{formatCurrency(parseFloat(form.amount || "0") * 0.10)}</span>
                &nbsp;&nbsp;·&nbsp;&nbsp;
                Setter: <span className="text-white font-medium">{formatCurrency(parseFloat(form.amount || "0") * 0.05)}</span>
              </p>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleAddPayment} className="flex-1">Record Payment</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Payment"
        subtitle="This cannot be undone."
        size="sm"
      >
        <p className="text-zinc-400 text-sm mb-5">
          Are you sure you want to delete this payment record? Associated commission entries will remain.
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1">Cancel</Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              if (confirmDelete) {
                deletePayment(confirmDelete);
                setConfirmDelete(null);
                toast.success("Payment deleted");
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
