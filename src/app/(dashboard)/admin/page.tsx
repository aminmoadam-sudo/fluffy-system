"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, ToggleLeft, ToggleRight, Shield, Users, Database, Download } from "lucide-react";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import { RoleBadge } from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/contexts/AppContext";
import type { UserRole } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { state, addTeamMember, updateTeamMember } = useApp();
  const { teamMembers, deals, payments, commissions, currentUser } = state;
  const router = useRouter();

  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [editMember, setEditMember] = useState<typeof teamMembers[0] | null>(null);
  const [activeTab, setActiveTab] = useState<"team" | "overview">("team");

  const [memberForm, setMemberForm] = useState({
    full_name: "",
    email: "",
    role: "setter" as UserRole,
  });

  if (currentUser?.role !== "admin") {
    return (
      <div>
        <Header title="Admin" />
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield size={40} className="text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Admin access required</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAddMember = () => {
    if (!memberForm.full_name.trim() || !memberForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (teamMembers.some((m) => m.email.toLowerCase() === memberForm.email.toLowerCase())) {
      toast.error("Email already in use");
      return;
    }
    addTeamMember({
      full_name: memberForm.full_name,
      email: memberForm.email.toLowerCase(),
      role: memberForm.role,
      is_active: true,
    });
    setMemberForm({ full_name: "", email: "", role: "setter" });
    setAddMemberOpen(false);
    toast.success("Team member added");
  };

  const handleEditMember = () => {
    if (!editMember) return;
    updateTeamMember(editMember);
    setEditMember(null);
    toast.success("Updated");
  };

  const toggleActive = (member: typeof teamMembers[0]) => {
    updateTeamMember({ ...member, is_active: !member.is_active });
    toast.success(member.is_active ? "Member deactivated" : "Member activated");
  };

  // System stats
  const totalRevenue = deals.reduce((s, d) => s + d.deal_value, 0);
  const totalCash = payments.reduce((s, p) => s + p.amount, 0);
  const totalCommOwed = commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);
  const totalCommPaid = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + (c.override_amount ?? c.amount), 0);

  const exportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      team_members: teamMembers,
      deals,
      payments,
      commissions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bayaan-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported");
  };

  return (
    <div>
      <Header
        title="Admin"
        subtitle="Team management and system controls"
        actions={
          <Button variant="ghost" size="sm" icon={Download} onClick={exportData}>
            Export Data
          </Button>
        }
      />

      <div className="p-6 space-y-5">
        {/* System overview */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Total Deals", value: deals.length.toString() },
            { label: "Total Revenue", value: formatCurrency(totalRevenue) },
            { label: "Cash Collected", value: formatCurrency(totalCash) },
            { label: "Commission Balance", value: formatCurrency(totalCommOwed) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
              <p className="text-zinc-500 text-xs mb-1">{label}</p>
              <p className="text-white font-bold text-xl">{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-lg p-1 w-fit">
          {(["team", "overview"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-green-800/40 text-green-300 border border-green-700/40"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "team" ? "Team Members" : "System Overview"}
            </button>
          ))}
        </div>

        {/* Team members */}
        {activeTab === "team" && (
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e1e1e] flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">Team Members</h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {teamMembers.filter((m) => m.is_active).length} active · {teamMembers.length} total
                </p>
              </div>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddMemberOpen(true)}>
                Add Member
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e1e1e]">
                    {["Name", "Email", "Role", "Status", "Joined", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-b border-[#1a1a1a] table-row-hover group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-green-900/40 border border-green-800/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-green-400 text-xs font-semibold">
                              {member.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <p className="text-zinc-200 text-sm font-medium">{member.full_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{member.email}</td>
                      <td className="px-4 py-3">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          member.is_active
                            ? "bg-green-900/30 text-green-400 border-green-800/30"
                            : "bg-zinc-800/40 text-zinc-500 border-zinc-700/30"
                        }`}>
                          {member.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {formatDate(member.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setEditMember({ ...member })}
                            className="p-1 rounded text-zinc-600 hover:text-zinc-300 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => toggleActive(member)}
                            className={`p-1 rounded transition-colors ${
                              member.is_active
                                ? "text-zinc-600 hover:text-amber-400"
                                : "text-zinc-600 hover:text-green-400"
                            }`}
                            title={member.is_active ? "Deactivate" : "Activate"}
                          >
                            {member.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* System overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Commission breakdown */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Commission Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Pending review", value: commissions.filter((c) => c.status === "pending").length, amount: commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0), color: "text-amber-400" },
                  { label: "Approved (unpaid)", value: commissions.filter((c) => c.status === "approved").length, amount: commissions.filter((c) => c.status === "approved").reduce((s, c) => s + (c.override_amount ?? c.amount), 0), color: "text-blue-400" },
                  { label: "Paid out", value: commissions.filter((c) => c.status === "paid").length, amount: totalCommPaid, color: "text-green-400" },
                ].map(({ label, value, amount, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                    <div>
                      <p className="text-zinc-300 text-sm">{label}</p>
                      <p className="text-zinc-600 text-xs">{value} records</p>
                    </div>
                    <p className={`font-bold text-base ${color}`}>{formatCurrency(amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Deal breakdown */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Deal Breakdown</h3>
              <div className="space-y-3">
                {[
                  { label: "Active deals", value: deals.filter((d) => d.status === "active").length, color: "text-blue-400" },
                  { label: "Completed (fully paid)", value: deals.filter((d) => d.status === "completed").length, color: "text-green-400" },
                  { label: "Overdue", value: deals.filter((d) => d.status === "overdue").length, color: "text-red-400" },
                  { label: "Payment plans", value: deals.filter((d) => d.payment_structure === "payment_plan").length, color: "text-purple-400" },
                  { label: "Paid in full", value: deals.filter((d) => d.payment_structure === "pif").length, color: "text-teal-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#1e1e1e] last:border-0">
                    <p className="text-zinc-300 text-sm">{label}</p>
                    <p className={`font-bold text-lg ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Data integrity */}
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 xl:col-span-2">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Database size={14} className="text-green-500" />
                Data Summary
              </h3>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Team Members", value: teamMembers.length },
                  { label: "Leads", value: state.leads.length },
                  { label: "Deals", value: deals.length },
                  { label: "Payments", value: payments.length },
                  { label: "Commissions", value: commissions.length },
                  { label: "Payout Records", value: state.payoutHistory.length },
                  { label: "Active Members", value: teamMembers.filter((m) => m.is_active).length },
                  { label: "Active Plans", value: deals.filter((d) => d.payment_structure === "payment_plan" && d.status === "active").length },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-white font-bold text-xl">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add member modal */}
      <Modal
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title="Add Team Member"
        subtitle="Create a new internal team account"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-zinc-500 text-xs mb-1">Full Name *</label>
            <input
              className="input-field"
              value={memberForm.full_name}
              onChange={(e) => setMemberForm((f) => ({ ...f, full_name: e.target.value }))}
              placeholder="Sarah Khalil"
            />
          </div>
          <div>
            <label className="block text-zinc-500 text-xs mb-1">Email *</label>
            <input
              type="email"
              className="input-field"
              value={memberForm.email}
              onChange={(e) => setMemberForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="sarah@bayaan.com"
            />
          </div>
          <div>
            <label className="block text-zinc-500 text-xs mb-1">Role *</label>
            <select
              className="select-field"
              value={memberForm.role}
              onChange={(e) => setMemberForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            >
              <option value="setter">Setter (5% commission)</option>
              <option value="closer">Closer (10% commission)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddMemberOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleAddMember} className="flex-1">Add Member</Button>
          </div>
        </div>
      </Modal>

      {/* Edit member modal */}
      {editMember && (
        <Modal
          open={!!editMember}
          onClose={() => setEditMember(null)}
          title="Edit Member"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Full Name</label>
              <input
                className="input-field"
                value={editMember.full_name}
                onChange={(e) => setEditMember((m) => m ? { ...m, full_name: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                value={editMember.email}
                onChange={(e) => setEditMember((m) => m ? { ...m, email: e.target.value } : null)}
              />
            </div>
            <div>
              <label className="block text-zinc-500 text-xs mb-1">Role</label>
              <select
                className="select-field"
                value={editMember.role}
                onChange={(e) => setEditMember((m) => m ? { ...m, role: e.target.value as UserRole } : null)}
              >
                <option value="setter">Setter</option>
                <option value="closer">Closer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" onClick={() => setEditMember(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={handleEditMember} className="flex-1">Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
