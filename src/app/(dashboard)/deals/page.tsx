"use client";
import { useState, useMemo } from "react";
import { Plus, Search, Filter } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { DealStatusBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import type { DealPaymentStructure, DealStatus } from "@/types";
import { formatCurrency, formatDate, percentage } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DealsPage() {
  const { state, addDeal } = useApp();
  const { deals, teamMembers, leads } = state;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DealStatus | "all">("all");
  const [filterType, setFilterType] = useState<DealPaymentStructure | "all">("all");
  const [addOpen, setAddOpen] = useState(false);

  const [form, setForm] = useState({
    lead_id: "",
    setter_id: "",
    closer_id: "",
    deal_value: "",
    payment_structure: "pif" as DealPaymentStructure,
    notes: "",
  });

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const leadMap = new Map(leads.map((l) => [l.id, l]));
  const setters = teamMembers.filter((m) => m.role === "setter");
  const closers = teamMembers.filter((m) => m.role === "closer");

  const filtered = useMemo(() => {
    let result = [...deals];
    if (filterStatus !== "all") result = result.filter((d) => d.status === filterStatus);
    if (filterType !== "all") result = result.filter((d) => d.payment_structure === filterType);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => {
        const lead = leadMap.get(d.lead_id);
        return (
          lead?.full_name.toLowerCase().includes(q) ||
          memberMap.get(d.closer_id)?.full_name.toLowerCase().includes(q) ||
          memberMap.get(d.setter_id)?.full_name.toLowerCase().includes(q)
        );
      });
    }
    return result.sort(
      (a, b) => new Date(b.closed_at).getTime() - new Date(a.closed_at).getTime()
    );
  }, [deals, filterStatus, filterType, search, leadMap, memberMap]);

  const totalValue = filtered.reduce((s, d) => s + d.deal_value, 0);
  const totalCollected = filtered.reduce((s, d) => s + d.total_collected, 0);
  const totalRemaining = filtered.reduce((s, d) => s + d.remaining_balance, 0);

  const handleAddDeal = () => {
    const value = parseFloat(form.deal_value);
    if (!form.setter_id || !form.closer_id || isNaN(value) || value <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    addDeal({
      lead_id: form.lead_id || `lead-${Date.now()}`,
      setter_id: form.setter_id,
      closer_id: form.closer_id,
      deal_value: value,
      payment_structure: form.payment_structure,
      status: "active",
      total_collected: 0,
      remaining_balance: value,
      closed_at: new Date().toISOString(),
    });
    setForm({ lead_id: "", setter_id: "", closer_id: "", deal_value: "", payment_structure: "pif", notes: "" });
    setAddOpen(false);
    toast.success("Deal added");
  };

  return (
    <div>
      <Header
        title="Deals"
        subtitle={`${deals.length} total deals · ${formatCurrency(totalCollected)} collected`}
        actions={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddOpen(true)}>
            New Deal
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Deal Value", value: formatCurrency(totalValue), sub: `${filtered.length} deals` },
            { label: "Cash Collected", value: formatCurrency(totalCollected), sub: `${percentage(totalCollected, totalValue)}% collected` },
            { label: "Remaining Balance", value: formatCurrency(totalRemaining), sub: "outstanding" },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">{label}</p>
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-zinc-600 text-xs mt-0.5">{sub}</p>
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
              placeholder="Search deals…"
              className="input-field pl-8 w-48"
            />
          </div>
          <select
            className="select-field w-36"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DealStatus | "all")}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="select-field w-36"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as DealPaymentStructure | "all")}
          >
            <option value="all">All Types</option>
            <option value="pif">Paid in Full</option>
            <option value="payment_plan">Payment Plan</option>
          </select>
          <span className="text-zinc-600 text-xs ml-auto">{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e1e1e]">
                  {["Student", "Value", "Type", "Collected", "Remaining", "Closer", "Setter", "Closed", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((deal) => {
                  const lead = leadMap.get(deal.lead_id);
                  const closer = memberMap.get(deal.closer_id);
                  const setter = memberMap.get(deal.setter_id);
                  const pct = deal.deal_value > 0
                    ? Math.round((deal.total_collected / deal.deal_value) * 100)
                    : 0;

                  return (
                    <tr key={deal.id} className="border-b border-[#1a1a1a] table-row-hover">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-zinc-200 text-sm font-medium">
                            {lead?.full_name || "Student"}
                          </p>
                          {lead?.application_details?.program && (
                            <p className="text-zinc-600 text-[11px]">
                              {lead.application_details.program}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold text-sm">
                        {formatCurrency(deal.deal_value)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          deal.payment_structure === "pif"
                            ? "bg-green-900/30 text-green-400 border border-green-800/30"
                            : "bg-blue-900/30 text-blue-400 border border-blue-800/30"
                        }`}>
                          {deal.payment_structure === "pif" ? "PIF" : "Plan"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-green-400 font-medium text-sm">
                            {formatCurrency(deal.total_collected)}
                          </span>
                          <div className="w-16 h-1 bg-[#1e1e1e] rounded-full mt-1.5 overflow-hidden">
                            <div
                              className="h-full bg-green-600 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {formatCurrency(deal.remaining_balance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {closer?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">
                        {setter?.full_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500 whitespace-nowrap">
                        {formatDate(deal.closed_at)}
                      </td>
                      <td className="px-4 py-3">
                        <DealStatusBadge status={deal.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-zinc-600 text-sm">
                No deals match your filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add deal modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Record New Deal"
        subtitle="Log a closed sale"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Lead (optional)</label>
              <select
                className="select-field"
                value={form.lead_id}
                onChange={(e) => setForm((f) => ({ ...f, lead_id: e.target.value }))}
              >
                <option value="">New / unlisted lead</option>
                {leads.filter((l) => l.stage !== "closed_won" && l.stage !== "closed_lost").map((l) => (
                  <option key={l.id} value={l.id}>{l.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Setter *</label>
              <select
                className="select-field"
                value={form.setter_id}
                onChange={(e) => setForm((f) => ({ ...f, setter_id: e.target.value }))}
              >
                <option value="">Select setter</option>
                {setters.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Closer *</label>
              <select
                className="select-field"
                value={form.closer_id}
                onChange={(e) => setForm((f) => ({ ...f, closer_id: e.target.value }))}
              >
                <option value="">Select closer</option>
                {closers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Deal Value ($) *</label>
              <input
                type="number"
                min="0"
                step="100"
                className="input-field"
                value={form.deal_value}
                onChange={(e) => setForm((f) => ({ ...f, deal_value: e.target.value }))}
                placeholder="3000"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Payment Type *</label>
              <select
                className="select-field"
                value={form.payment_structure}
                onChange={(e) => setForm((f) => ({ ...f, payment_structure: e.target.value as DealPaymentStructure }))}
              >
                <option value="pif">Paid in Full</option>
                <option value="payment_plan">Payment Plan</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddDeal} className="flex-1">
              Record Deal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
