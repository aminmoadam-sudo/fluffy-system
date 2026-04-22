import type {
  Deal,
  Payment,
  TeamMember,
  Commission,
  PayoutHistory,
  SetterPayoutSummary,
  CloserPayoutSummary,
} from "@/types";
import {
  isWithinDays,
  isSameMonth,
  SETTER_RATE,
  CLOSER_RATE,
  BIWEEKLY_DAYS,
} from "./utils";

interface PaymentWithDeal extends Payment {
  deal: Deal;
}

function enrichPayments(payments: Payment[], deals: Deal[]): PaymentWithDeal[] {
  const dealMap = new Map(deals.map((d) => [d.id, d]));
  return payments
    .map((p) => ({ ...p, deal: dealMap.get(p.deal_id)! }))
    .filter((p) => p.deal != null);
}

// Setter bi-weekly: cash collected in last 14 days on their deals (current-month deals only for biweekly)
export function calcSetterBiweeklyPayout(
  setterId: string,
  payments: Payment[],
  deals: Deal[]
): number {
  const now = new Date();
  const enriched = enrichPayments(payments, deals);
  return enriched
    .filter(
      (p) =>
        p.deal.setter_id === setterId &&
        isWithinDays(p.payment_date, BIWEEKLY_DAYS)
    )
    .reduce((sum, p) => sum + p.amount, 0) * SETTER_RATE;
}

// Setter end-of-month catch-up: payment plan installments collected THIS month
// from deals created in PREVIOUS months
export function calcSetterCatchupPayout(
  setterId: string,
  payments: Payment[],
  deals: Deal[],
  referenceDate: Date = new Date()
): number {
  const enriched = enrichPayments(payments, deals);
  const refMonth = referenceDate;

  return enriched
    .filter((p) => {
      const dealCreated = new Date(p.deal.created_at);
      const paymentInCurrentMonth = isSameMonth(p.payment_date, refMonth);
      const dealFromPreviousMonth =
        dealCreated < new Date(refMonth.getFullYear(), refMonth.getMonth(), 1);
      return (
        p.deal.setter_id === setterId &&
        paymentInCurrentMonth &&
        dealFromPreviousMonth
      );
    })
    .reduce((sum, p) => sum + p.amount, 0) * SETTER_RATE;
}

// Closer monthly: all cash collected this month on their deals
export function calcCloserMonthlyPayout(
  closerId: string,
  payments: Payment[],
  deals: Deal[],
  referenceDate: Date = new Date()
): number {
  const enriched = enrichPayments(payments, deals);
  return enriched
    .filter(
      (p) =>
        p.deal.closer_id === closerId &&
        isSameMonth(p.payment_date, referenceDate)
    )
    .reduce((sum, p) => sum + p.amount, 0) * CLOSER_RATE;
}

// Cash collected in last 14 days for a setter
export function calcSetterBiweeklyCash(
  setterId: string,
  payments: Payment[],
  deals: Deal[]
): number {
  const enriched = enrichPayments(payments, deals);
  return enriched
    .filter(
      (p) =>
        p.deal.setter_id === setterId &&
        isWithinDays(p.payment_date, BIWEEKLY_DAYS)
    )
    .reduce((sum, p) => sum + p.amount, 0);
}

// Catch-up cash amount for a setter (previous-month deal installments collected this month)
export function calcSetterCatchupCash(
  setterId: string,
  payments: Payment[],
  deals: Deal[],
  referenceDate: Date = new Date()
): number {
  const enriched = enrichPayments(payments, deals);
  return enriched
    .filter((p) => {
      const dealCreated = new Date(p.deal.created_at);
      const paymentInCurrentMonth = isSameMonth(p.payment_date, referenceDate);
      const dealFromPreviousMonth =
        dealCreated < new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
      return (
        p.deal.setter_id === setterId &&
        paymentInCurrentMonth &&
        dealFromPreviousMonth
      );
    })
    .reduce((sum, p) => sum + p.amount, 0);
}

// Monthly cash for a closer
export function calcCloserMonthlyCash(
  closerId: string,
  payments: Payment[],
  deals: Deal[],
  referenceDate: Date = new Date()
): number {
  const enriched = enrichPayments(payments, deals);
  return enriched
    .filter(
      (p) =>
        p.deal.closer_id === closerId &&
        isSameMonth(p.payment_date, referenceDate)
    )
    .reduce((sum, p) => sum + p.amount, 0);
}

// Historical total paid to a team member
export function calcTotalPaid(
  memberId: string,
  payoutHistory: PayoutHistory[]
): number {
  return payoutHistory
    .filter((ph) => ph.team_member_id === memberId)
    .reduce((sum, ph) => sum + ph.amount, 0);
}

// Total unpaid commissions for a team member
export function calcTotalUnpaid(
  memberId: string,
  commissions: Commission[]
): number {
  return commissions
    .filter(
      (c) =>
        c.team_member_id === memberId &&
        (c.status === "pending" || c.status === "approved")
    )
    .reduce((sum, c) => sum + (c.override_amount ?? c.amount), 0);
}

// Build setter payout summaries
export function buildSetterSummaries(
  setters: TeamMember[],
  payments: Payment[],
  deals: Deal[],
  commissions: Commission[],
  payoutHistory: PayoutHistory[]
): SetterPayoutSummary[] {
  return setters.map((setter) => ({
    setter,
    biweekly_cash: calcSetterBiweeklyCash(setter.id, payments, deals),
    biweekly_commission: calcSetterBiweeklyPayout(setter.id, payments, deals),
    catchup_cash: calcSetterCatchupCash(setter.id, payments, deals),
    catchup_commission: calcSetterCatchupPayout(setter.id, payments, deals),
    total_paid_historically: calcTotalPaid(setter.id, payoutHistory),
    total_unpaid: calcTotalUnpaid(setter.id, commissions),
  }));
}

// Build closer payout summaries
export function buildCloserSummaries(
  closers: TeamMember[],
  payments: Payment[],
  deals: Deal[],
  commissions: Commission[],
  payoutHistory: PayoutHistory[]
): CloserPayoutSummary[] {
  return closers.map((closer) => ({
    closer,
    monthly_cash: calcCloserMonthlyCash(closer.id, payments, deals),
    monthly_commission: calcCloserMonthlyPayout(closer.id, payments, deals),
    total_paid_historically: calcTotalPaid(closer.id, payoutHistory),
    total_unpaid: calcTotalUnpaid(closer.id, commissions),
  }));
}

// Dashboard metrics helpers
export function calcTotalCashCollected(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function calcTotalExpectedRevenue(deals: Deal[]): number {
  return deals.reduce((sum, d) => sum + d.deal_value, 0);
}

export function calcTotalCommissionsOwed(commissions: Commission[]): number {
  return commissions
    .filter((c) => c.status === "pending" || c.status === "approved")
    .reduce((sum, c) => sum + (c.override_amount ?? c.amount), 0);
}

export function calcTotalCommissionsPaid(commissions: Commission[]): number {
  return commissions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.override_amount ?? c.amount), 0);
}

export function calcOverdueBalance(deals: Deal[]): number {
  return deals
    .filter((d) => d.status === "overdue")
    .reduce((sum, d) => sum + d.remaining_balance, 0);
}

export function getMonthlyRevenue(
  payments: Payment[],
  deals: Deal[]
): { month: string; revenue: number; collected: number }[] {
  const enriched = enrichPayments(payments, deals);
  const monthMap = new Map<string, { revenue: number; collected: number }>();

  // Add collected amounts from payments
  enriched.forEach((p) => {
    const d = new Date(p.payment_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    const existing = monthMap.get(key) || { revenue: 0, collected: 0 };
    monthMap.set(key, {
      revenue: existing.revenue,
      collected: existing.collected + p.amount,
    });
  });

  // Add deal values by close date
  deals.forEach((d) => {
    const date = new Date(d.closed_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthMap.get(key) || { revenue: 0, collected: 0 };
    monthMap.set(key, {
      revenue: existing.revenue + d.deal_value,
      collected: existing.collected,
    });
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1);
      return {
        month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        ...val,
      };
    });
}

export function getCashByMember(
  payments: Payment[],
  deals: Deal[],
  members: TeamMember[],
  role: "setter" | "closer"
): { member_id: string; member_name: string; amount: number }[] {
  const enriched = enrichPayments(payments, deals);
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const amountByMember = new Map<string, number>();
  enriched.forEach((p) => {
    const memberId = role === "setter" ? p.deal.setter_id : p.deal.closer_id;
    if (!memberId) return;
    amountByMember.set(memberId, (amountByMember.get(memberId) || 0) + p.amount);
  });

  return Array.from(amountByMember.entries())
    .map(([member_id, amount]) => ({
      member_id,
      member_name: memberMap.get(member_id)?.full_name || "Unknown",
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}
