export type UserRole = "admin" | "setter" | "closer";

export type LeadStage =
  | "applied"
  | "qualified"
  | "contacted"
  | "booked"
  | "no_show"
  | "closed_won"
  | "closed_lost";

export type PaymentType = "pif" | "installment" | "partial";

export type DealPaymentStructure = "pif" | "payment_plan";

export type DealStatus = "active" | "completed" | "overdue" | "cancelled";

export type CommissionType = "biweekly" | "monthly" | "catchup";

export type CommissionStatus = "pending" | "approved" | "paid";

export type PayoutPeriodType = "biweekly" | "monthly";

export type PayoutPeriodStatus = "pending" | "processing" | "completed";

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  stage: LeadStage;
  setter_id: string | null;
  closer_id: string | null;
  application_details: Record<string, string> | null;
  notes: string;
  created_at: string;
  updated_at: string;
  stage_history: StageHistory[];
}

export interface StageHistory {
  id: string;
  lead_id: string;
  from_stage: LeadStage | null;
  to_stage: LeadStage;
  changed_by: string;
  notes: string;
  created_at: string;
}

export interface Deal {
  id: string;
  lead_id: string;
  setter_id: string;
  closer_id: string;
  deal_value: number;
  payment_structure: DealPaymentStructure;
  status: DealStatus;
  total_collected: number;
  remaining_balance: number;
  closed_at: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
  setter?: TeamMember;
  closer?: TeamMember;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  deal_id: string;
  amount: number;
  payment_date: string;
  payment_type: PaymentType;
  notes: string;
  recorded_by: string;
  created_at: string;
  deal?: Deal;
}

export interface Commission {
  id: string;
  payment_id: string;
  team_member_id: string;
  role: "setter" | "closer";
  commission_type: CommissionType;
  amount: number;
  rate: number;
  status: CommissionStatus;
  override_amount: number | null;
  override_reason: string | null;
  pay_period_start: string;
  pay_period_end: string;
  created_at: string;
  updated_at: string;
  team_member?: TeamMember;
  payment?: Payment;
}

export interface PayoutPeriod {
  id: string;
  period_type: PayoutPeriodType;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: PayoutPeriodStatus;
  created_at: string;
}

export interface PayoutHistory {
  id: string;
  team_member_id: string;
  payout_period_id: string;
  amount: number;
  paid_at: string;
  notes: string;
  created_by: string;
  team_member?: TeamMember;
  payout_period?: PayoutPeriod;
}

export interface DashboardMetrics {
  total_cash_collected: number;
  total_expected_revenue: number;
  total_commissions_owed: number;
  total_commissions_paid: number;
  deals_closed_this_month: number;
  active_payment_plans: number;
  overdue_balances: number;
  revenue_by_month: MonthlyRevenue[];
  cash_by_closer: MemberCash[];
  cash_by_setter: MemberCash[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  collected: number;
}

export interface MemberCash {
  member_id: string;
  member_name: string;
  amount: number;
}

export interface SetterPayoutSummary {
  setter: TeamMember;
  biweekly_cash: number;
  biweekly_commission: number;
  catchup_cash: number;
  catchup_commission: number;
  total_paid_historically: number;
  total_unpaid: number;
}

export interface CloserPayoutSummary {
  closer: TeamMember;
  monthly_cash: number;
  monthly_commission: number;
  total_paid_historically: number;
  total_unpaid: number;
}

export interface AppState {
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  leads: Lead[];
  deals: Deal[];
  payments: Payment[];
  commissions: Commission[];
  payoutPeriods: PayoutPeriod[];
  payoutHistory: PayoutHistory[];
}
