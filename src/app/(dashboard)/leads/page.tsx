"use client";
import { useState, useMemo } from "react";
import { Plus, ChevronRight, Phone, Mail, Clock, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { StageBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import type { LeadStage } from "@/types";
import { formatRelativeDate, generateId } from "@/lib/utils";
import toast from "react-hot-toast";

const STAGES: { key: LeadStage; label: string; color: string }[] = [
  { key: "applied", label: "Applied", color: "#6b7280" },
  { key: "qualified", label: "Qualified", color: "#3b82f6" },
  { key: "contacted", label: "Contacted", color: "#14b8a6" },
  { key: "booked", label: "Booked", color: "#a855f7" },
  { key: "no_show", label: "No Show", color: "#f59e0b" },
  { key: "closed_won", label: "Closed Won", color: "#22c55e" },
  { key: "closed_lost", label: "Closed Lost", color: "#ef4444" },
];

export default function LeadsPage() {
  const { state, addLead, updateLeadStage } = useApp();
  const { leads, teamMembers } = state;
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [movingLead, setMovingLead] = useState<{ id: string; name: string } | null>(null);
  const [targetStage, setTargetStage] = useState<LeadStage>("applied");

  // New lead form
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    notes: "",
    setter_id: "",
    closer_id: "",
    program: "",
  });

  const memberMap = new Map(teamMembers.map((m) => [m.id, m]));
  const setters = teamMembers.filter((m) => m.role === "setter");
  const closers = teamMembers.filter((m) => m.role === "closer");

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        l.full_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(q)
    );
  }, [leads, search]);

  const leadsByStage = useMemo(() => {
    const map = new Map<LeadStage, typeof leads>();
    STAGES.forEach(({ key }) => map.set(key, []));
    filteredLeads.forEach((l) => {
      const bucket = map.get(l.stage) || [];
      bucket.push(l);
      map.set(l.stage, bucket);
    });
    return map;
  }, [filteredLeads]);

  const detailLead = leads.find((l) => l.id === selectedLead);

  const handleAddLead = () => {
    if (!form.full_name.trim()) {
      toast.error("Name is required");
      return;
    }
    addLead({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      stage: "applied",
      setter_id: form.setter_id || null,
      closer_id: form.closer_id || null,
      application_details: form.program ? { program: form.program } : null,
      notes: form.notes,
    });
    setForm({ full_name: "", email: "", phone: "", notes: "", setter_id: "", closer_id: "", program: "" });
    setAddOpen(false);
    toast.success("Lead added");
  };

  const handleMoveStage = () => {
    if (!movingLead) return;
    updateLeadStage(movingLead.id, targetStage);
    setMovingLead(null);
    toast.success(`Moved to ${STAGES.find((s) => s.key === targetStage)?.label}`);
  };

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.stage === "closed_won").length;
  const convRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

  return (
    <div>
      <Header
        title="Pipeline"
        subtitle={`${totalLeads} leads · ${convRate}% conversion rate`}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setAddOpen(true)}
          >
            Add Lead
          </Button>
        }
      />

      <div className="p-6">
        {/* Search */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leads…"
              className="input-field pl-8"
            />
          </div>
          <span className="text-zinc-600 text-xs">
            {filteredLeads.length} of {leads.length}
          </span>
        </div>

        {/* Kanban board */}
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(({ key, label, color }) => {
            const stageLeads = leadsByStage.get(key) || [];
            return (
              <div
                key={key}
                className="flex-shrink-0 w-56 bg-[#111111] border border-[#1e1e1e] rounded-xl overflow-hidden"
              >
                {/* Column header */}
                <div className="px-3 py-2.5 border-b border-[#1e1e1e] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs font-medium text-zinc-300">{label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 bg-zinc-800/60 px-1.5 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2 min-h-[120px]">
                  {stageLeads.map((lead) => {
                    const setter = lead.setter_id ? memberMap.get(lead.setter_id) : null;
                    const closer = lead.closer_id ? memberMap.get(lead.closer_id) : null;
                    return (
                      <div
                        key={lead.id}
                        className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3 cursor-pointer hover:border-green-900/50 transition-all card-hover"
                        onClick={() => setSelectedLead(lead.id)}
                      >
                        <p className="text-zinc-200 text-xs font-medium leading-snug mb-2">
                          {lead.full_name}
                        </p>
                        {lead.application_details?.program && (
                          <p className="text-zinc-600 text-[10px] mb-2 truncate">
                            {lead.application_details.program}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {setter && (
                              <div
                                className="w-4 h-4 rounded-full bg-teal-900/60 border border-teal-800/50 flex items-center justify-center"
                                title={`Setter: ${setter.full_name}`}
                              >
                                <span className="text-teal-400 text-[8px] font-bold">
                                  {setter.full_name[0]}
                                </span>
                              </div>
                            )}
                            {closer && (
                              <div
                                className="w-4 h-4 rounded-full bg-green-900/60 border border-green-800/50 flex items-center justify-center"
                                title={`Closer: ${closer.full_name}`}
                              >
                                <span className="text-green-400 text-[8px] font-bold">
                                  {closer.full_name[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-zinc-600 text-[10px]">
                            {formatRelativeDate(lead.created_at)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="flex items-center justify-center h-16">
                      <p className="text-zinc-700 text-[10px]">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead detail modal */}
      {detailLead && (
        <Modal
          open={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={detailLead.full_name}
          subtitle={detailLead.email}
          size="lg"
        >
          <div className="space-y-5">
            {/* Status + contact */}
            <div className="flex items-center gap-3 flex-wrap">
              <StageBadge stage={detailLead.stage} />
              {detailLead.phone && (
                <a href={`tel:${detailLead.phone}`} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Phone size={11} /> {detailLead.phone}
                </a>
              )}
              {detailLead.email && (
                <a href={`mailto:${detailLead.email}`} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <Mail size={11} /> {detailLead.email}
                </a>
              )}
            </div>

            {/* Team */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Setter</p>
                <p className="text-zinc-200 text-sm font-medium">
                  {detailLead.setter_id
                    ? memberMap.get(detailLead.setter_id)?.full_name
                    : "Unassigned"}
                </p>
              </div>
              <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                <p className="text-zinc-600 text-[10px] uppercase tracking-wider mb-1">Closer</p>
                <p className="text-zinc-200 text-sm font-medium">
                  {detailLead.closer_id
                    ? memberMap.get(detailLead.closer_id)?.full_name
                    : "Unassigned"}
                </p>
              </div>
            </div>

            {/* Move stage */}
            <div>
              <p className="text-zinc-500 text-xs font-medium mb-2">Move to stage</p>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.filter((s) => s.key !== detailLead.stage).map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => {
                      updateLeadStage(detailLead.id, key);
                      toast.success(`Moved to ${label}`);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-[#2a2a2a] text-zinc-400 hover:text-zinc-200 hover:border-[#3a3a3a] transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            {detailLead.notes && (
              <div>
                <p className="text-zinc-500 text-xs font-medium mb-1">Notes</p>
                <p className="text-zinc-300 text-sm leading-relaxed bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                  {detailLead.notes}
                </p>
              </div>
            )}

            {/* Stage history */}
            <div>
              <p className="text-zinc-500 text-xs font-medium mb-2 flex items-center gap-1.5">
                <Clock size={11} /> Timeline
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...detailLead.stage_history]
                  .reverse()
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start gap-2.5 text-xs"
                    >
                      <ChevronRight size={11} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-zinc-300">
                          {entry.from_stage
                            ? `${STAGES.find((s) => s.key === entry.from_stage)?.label} → `
                            : ""}
                          <span className="text-green-400 font-medium">
                            {STAGES.find((s) => s.key === entry.to_stage)?.label}
                          </span>
                        </span>
                        {entry.notes && (
                          <p className="text-zinc-600 mt-0.5">{entry.notes}</p>
                        )}
                        <p className="text-zinc-700 mt-0.5">
                          {formatRelativeDate(entry.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add lead modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Lead"
        subtitle="Add a prospect to the pipeline"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Full Name *</label>
              <input
                className="input-field"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                placeholder="Yusuf Abdullah"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Email</label>
              <input
                className="input-field"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="student@email.com"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Phone</label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+1-555-0100"
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Setter</label>
              <select
                className="select-field"
                value={form.setter_id}
                onChange={(e) => setForm((f) => ({ ...f, setter_id: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {setters.map((s) => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Closer</label>
              <select
                className="select-field"
                value={form.closer_id}
                onChange={(e) => setForm((f) => ({ ...f, closer_id: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {closers.map((c) => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Program of Interest</label>
              <input
                className="input-field"
                value={form.program}
                onChange={(e) => setForm((f) => ({ ...f, program: e.target.value }))}
                placeholder="e.g. Tajweed Mastery"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-zinc-500 text-xs mb-1">Notes</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Any relevant notes…"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLead} className="flex-1">
              Add Lead
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
