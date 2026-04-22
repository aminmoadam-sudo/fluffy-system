"use client";
import React, { createContext, useContext, useReducer, useCallback } from "react";
import type {
  AppState,
  TeamMember,
  Lead,
  Deal,
  Payment,
  Commission,
  CommissionStatus,
  LeadStage,
} from "@/types";
import {
  MOCK_TEAM_MEMBERS,
  MOCK_LEADS,
  MOCK_DEALS,
  MOCK_PAYMENTS,
  MOCK_COMMISSIONS,
  MOCK_PAYOUT_PERIODS,
  MOCK_PAYOUT_HISTORY,
} from "@/lib/mock-data";
import { generateId } from "@/lib/utils";

type Action =
  | { type: "LOGIN"; payload: TeamMember }
  | { type: "LOGOUT" }
  | { type: "ADD_LEAD"; payload: Lead }
  | { type: "UPDATE_LEAD"; payload: Lead }
  | { type: "UPDATE_LEAD_STAGE"; payload: { leadId: string; stage: LeadStage; changedBy: string; notes?: string } }
  | { type: "ADD_DEAL"; payload: Deal }
  | { type: "UPDATE_DEAL"; payload: Deal }
  | { type: "ADD_PAYMENT"; payload: Payment }
  | { type: "UPDATE_PAYMENT"; payload: Payment }
  | { type: "DELETE_PAYMENT"; payload: string }
  | { type: "UPDATE_COMMISSION_STATUS"; payload: { id: string; status: CommissionStatus; override_amount?: number; override_reason?: string } }
  | { type: "MARK_COMMISSIONS_PAID"; payload: { memberIds: string[]; periodId: string; amount: number; notes: string; createdBy: string } }
  | { type: "ADD_TEAM_MEMBER"; payload: TeamMember }
  | { type: "UPDATE_TEAM_MEMBER"; payload: TeamMember };

const initialState: AppState = {
  currentUser: null,
  teamMembers: MOCK_TEAM_MEMBERS,
  leads: MOCK_LEADS,
  deals: MOCK_DEALS,
  payments: MOCK_PAYMENTS,
  commissions: MOCK_COMMISSIONS,
  payoutPeriods: MOCK_PAYOUT_PERIODS,
  payoutHistory: MOCK_PAYOUT_HISTORY,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, currentUser: action.payload };

    case "LOGOUT":
      return { ...state, currentUser: null };

    case "ADD_LEAD":
      return { ...state, leads: [action.payload, ...state.leads] };

    case "UPDATE_LEAD":
      return {
        ...state,
        leads: state.leads.map((l) =>
          l.id === action.payload.id ? action.payload : l
        ),
      };

    case "UPDATE_LEAD_STAGE": {
      const { leadId, stage, changedBy, notes } = action.payload;
      return {
        ...state,
        leads: state.leads.map((l) => {
          if (l.id !== leadId) return l;
          const historyEntry = {
            id: generateId(),
            lead_id: leadId,
            from_stage: l.stage,
            to_stage: stage,
            changed_by: changedBy,
            notes: notes || "",
            created_at: new Date().toISOString(),
          };
          return {
            ...l,
            stage,
            updated_at: new Date().toISOString(),
            stage_history: [...l.stage_history, historyEntry],
          };
        }),
      };
    }

    case "ADD_DEAL": {
      // Recalc remaining balance
      const deal = {
        ...action.payload,
        remaining_balance: action.payload.deal_value - action.payload.total_collected,
      };
      return { ...state, deals: [deal, ...state.deals] };
    }

    case "UPDATE_DEAL":
      return {
        ...state,
        deals: state.deals.map((d) =>
          d.id === action.payload.id ? action.payload : d
        ),
      };

    case "ADD_PAYMENT": {
      const payment = action.payload;
      // Update the deal's total_collected and remaining_balance
      const updatedDeals = state.deals.map((d) => {
        if (d.id !== payment.deal_id) return d;
        const newCollected = d.total_collected + payment.amount;
        const newRemaining = Math.max(0, d.deal_value - newCollected);
        return {
          ...d,
          total_collected: newCollected,
          remaining_balance: newRemaining,
          status: newRemaining === 0 ? ("completed" as const) : d.status,
          updated_at: new Date().toISOString(),
        };
      });

      // Auto-generate commission records for the payment
      const deal = updatedDeals.find((d) => d.id === payment.deal_id);
      const newCommissions: Commission[] = [];
      if (deal) {
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        const dealCreated = new Date(deal.created_at);
        const isOldDeal =
          dealCreated < new Date(now.getFullYear(), now.getMonth(), 1);

        // Closer commission
        newCommissions.push({
          id: generateId(),
          payment_id: payment.id,
          team_member_id: deal.closer_id,
          role: "closer",
          commission_type: "monthly",
          amount: payment.amount * 0.1,
          rate: 0.1,
          status: "pending",
          override_amount: null,
          override_reason: null,
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // Setter commission
        newCommissions.push({
          id: generateId(),
          payment_id: payment.id,
          team_member_id: deal.setter_id,
          role: "setter",
          commission_type: isOldDeal ? "catchup" : "biweekly",
          amount: payment.amount * 0.05,
          rate: 0.05,
          status: "pending",
          override_amount: null,
          override_reason: null,
          pay_period_start: periodStart,
          pay_period_end: periodEnd,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return {
        ...state,
        deals: updatedDeals,
        payments: [payment, ...state.payments],
        commissions: [...newCommissions, ...state.commissions],
      };
    }

    case "UPDATE_PAYMENT":
      return {
        ...state,
        payments: state.payments.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case "DELETE_PAYMENT":
      return {
        ...state,
        payments: state.payments.filter((p) => p.id !== action.payload),
      };

    case "UPDATE_COMMISSION_STATUS":
      return {
        ...state,
        commissions: state.commissions.map((c) => {
          if (c.id !== action.payload.id) return c;
          return {
            ...c,
            status: action.payload.status,
            override_amount: action.payload.override_amount ?? c.override_amount,
            override_reason: action.payload.override_reason ?? c.override_reason,
            updated_at: new Date().toISOString(),
          };
        }),
      };

    case "MARK_COMMISSIONS_PAID": {
      const { memberIds, periodId, amount, notes, createdBy } = action.payload;
      // Mark all approved commissions for these members as paid
      const updatedCommissions = state.commissions.map((c) => {
        if (memberIds.includes(c.team_member_id) && c.status === "approved") {
          return { ...c, status: "paid" as CommissionStatus, updated_at: new Date().toISOString() };
        }
        return c;
      });
      // Create payout history entries
      const newPayoutEntries = memberIds.map((memberId) => ({
        id: generateId(),
        team_member_id: memberId,
        payout_period_id: periodId,
        amount,
        paid_at: new Date().toISOString(),
        notes,
        created_by: createdBy,
      }));
      return {
        ...state,
        commissions: updatedCommissions,
        payoutHistory: [...newPayoutEntries, ...state.payoutHistory],
      };
    }

    case "ADD_TEAM_MEMBER":
      return { ...state, teamMembers: [...state.teamMembers, action.payload] };

    case "UPDATE_TEAM_MEMBER":
      return {
        ...state,
        teamMembers: state.teamMembers.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  login: (email: string) => boolean;
  logout: () => void;
  addLead: (lead: Omit<Lead, "id" | "created_at" | "updated_at" | "stage_history">) => void;
  updateLead: (lead: Lead) => void;
  updateLeadStage: (leadId: string, stage: LeadStage, notes?: string) => void;
  addDeal: (deal: Omit<Deal, "id" | "created_at" | "updated_at">) => void;
  updateDeal: (deal: Deal) => void;
  addPayment: (payment: Omit<Payment, "id" | "created_at">) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  updateCommissionStatus: (id: string, status: CommissionStatus, overrideAmount?: number, overrideReason?: string) => void;
  markCommissionsPaid: (memberIds: string[], periodId: string, amount: number, notes: string) => void;
  addTeamMember: (member: Omit<TeamMember, "id" | "created_at">) => void;
  updateTeamMember: (member: TeamMember) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback((email: string): boolean => {
    const member = state.teamMembers.find(
      (m) => m.email.toLowerCase() === email.toLowerCase()
    );
    if (member) {
      dispatch({ type: "LOGIN", payload: member });
      return true;
    }
    return false;
  }, [state.teamMembers]);

  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);

  const addLead = useCallback((lead: Omit<Lead, "id" | "created_at" | "updated_at" | "stage_history">) => {
    const now = new Date().toISOString();
    const id = generateId();
    dispatch({
      type: "ADD_LEAD",
      payload: {
        ...lead,
        id,
        created_at: now,
        updated_at: now,
        stage_history: [{
          id: generateId(),
          lead_id: id,
          from_stage: null,
          to_stage: lead.stage,
          changed_by: state.currentUser?.id || "admin-001",
          notes: "Lead created",
          created_at: now,
        }],
      },
    });
  }, [state.currentUser]);

  const updateLead = useCallback((lead: Lead) => {
    dispatch({ type: "UPDATE_LEAD", payload: { ...lead, updated_at: new Date().toISOString() } });
  }, []);

  const updateLeadStage = useCallback((leadId: string, stage: LeadStage, notes?: string) => {
    dispatch({
      type: "UPDATE_LEAD_STAGE",
      payload: { leadId, stage, changedBy: state.currentUser?.id || "admin-001", notes },
    });
  }, [state.currentUser]);

  const addDeal = useCallback((deal: Omit<Deal, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString();
    dispatch({
      type: "ADD_DEAL",
      payload: { ...deal, id: generateId(), created_at: now, updated_at: now },
    });
  }, []);

  const updateDeal = useCallback((deal: Deal) => {
    dispatch({ type: "UPDATE_DEAL", payload: { ...deal, updated_at: new Date().toISOString() } });
  }, []);

  const addPayment = useCallback((payment: Omit<Payment, "id" | "created_at">) => {
    dispatch({
      type: "ADD_PAYMENT",
      payload: { ...payment, id: generateId(), created_at: new Date().toISOString() },
    });
  }, []);

  const updatePayment = useCallback((payment: Payment) => {
    dispatch({ type: "UPDATE_PAYMENT", payload: payment });
  }, []);

  const deletePayment = useCallback((id: string) => {
    dispatch({ type: "DELETE_PAYMENT", payload: id });
  }, []);

  const updateCommissionStatus = useCallback((
    id: string,
    status: CommissionStatus,
    overrideAmount?: number,
    overrideReason?: string
  ) => {
    dispatch({ type: "UPDATE_COMMISSION_STATUS", payload: { id, status, override_amount: overrideAmount, override_reason: overrideReason } });
  }, []);

  const markCommissionsPaid = useCallback((
    memberIds: string[],
    periodId: string,
    amount: number,
    notes: string
  ) => {
    dispatch({
      type: "MARK_COMMISSIONS_PAID",
      payload: { memberIds, periodId, amount, notes, createdBy: state.currentUser?.id || "admin-001" },
    });
  }, [state.currentUser]);

  const addTeamMember = useCallback((member: Omit<TeamMember, "id" | "created_at">) => {
    dispatch({
      type: "ADD_TEAM_MEMBER",
      payload: { ...member, id: generateId(), created_at: new Date().toISOString() },
    });
  }, []);

  const updateTeamMember = useCallback((member: TeamMember) => {
    dispatch({ type: "UPDATE_TEAM_MEMBER", payload: member });
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      login,
      logout,
      addLead,
      updateLead,
      updateLeadStage,
      addDeal,
      updateDeal,
      addPayment,
      updatePayment,
      deletePayment,
      updateCommissionStatus,
      markCommissionsPaid,
      addTeamMember,
      updateTeamMember,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
