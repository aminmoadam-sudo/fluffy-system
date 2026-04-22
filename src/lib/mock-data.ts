import type {
  TeamMember,
  Lead,
  Deal,
  Payment,
  Commission,
  PayoutPeriod,
  PayoutHistory,
} from "@/types";

// Today: April 22, 2026

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "admin-001",
    email: "omar@bayaan.com",
    full_name: "Omar Al-Rashid",
    role: "admin",
    is_active: true,
    created_at: "2025-09-01T00:00:00Z",
  },
  {
    id: "setter-001",
    email: "sarah@bayaan.com",
    full_name: "Sarah Khalil",
    role: "setter",
    is_active: true,
    created_at: "2025-09-01T00:00:00Z",
  },
  {
    id: "setter-002",
    email: "michael@bayaan.com",
    full_name: "Michael Torres",
    role: "setter",
    is_active: true,
    created_at: "2025-10-15T00:00:00Z",
  },
  {
    id: "closer-001",
    email: "ahmed@bayaan.com",
    full_name: "Ahmed Hassan",
    role: "closer",
    is_active: true,
    created_at: "2025-09-01T00:00:00Z",
  },
  {
    id: "closer-002",
    email: "fatima@bayaan.com",
    full_name: "Fatima Al-Zahra",
    role: "closer",
    is_active: true,
    created_at: "2025-10-01T00:00:00Z",
  },
];

export const MOCK_LEADS: Lead[] = [
  // Active pipeline leads
  {
    id: "lead-001",
    full_name: "Yusuf Abdullah",
    email: "yusuf.a@email.com",
    phone: "+1-555-0101",
    stage: "booked",
    setter_id: "setter-001",
    closer_id: "closer-001",
    application_details: { program: "Tajweed Mastery", level: "Beginner" },
    notes: "Very motivated student. Wants to start ASAP.",
    created_at: "2026-04-18T10:00:00Z",
    updated_at: "2026-04-20T14:00:00Z",
    stage_history: [
      { id: "sh-001a", lead_id: "lead-001", from_stage: null, to_stage: "applied", changed_by: "setter-001", notes: "Applied online", created_at: "2026-04-18T10:00:00Z" },
      { id: "sh-001b", lead_id: "lead-001", from_stage: "applied", to_stage: "qualified", changed_by: "setter-001", notes: "Confirmed strong interest", created_at: "2026-04-19T09:00:00Z" },
      { id: "sh-001c", lead_id: "lead-001", from_stage: "qualified", to_stage: "booked", changed_by: "setter-001", notes: "Call booked for Apr 21", created_at: "2026-04-20T14:00:00Z" },
    ],
  },
  {
    id: "lead-002",
    full_name: "Amina Osei",
    email: "amina.osei@email.com",
    phone: "+1-555-0102",
    stage: "contacted",
    setter_id: "setter-002",
    closer_id: null,
    application_details: { program: "Arabic Foundations", level: "Zero" },
    notes: "Interested in full Arabic reading course.",
    created_at: "2026-04-17T08:00:00Z",
    updated_at: "2026-04-19T11:00:00Z",
    stage_history: [
      { id: "sh-002a", lead_id: "lead-002", from_stage: null, to_stage: "applied", changed_by: "setter-002", notes: "", created_at: "2026-04-17T08:00:00Z" },
      { id: "sh-002b", lead_id: "lead-002", from_stage: "applied", to_stage: "contacted", changed_by: "setter-002", notes: "Left voicemail", created_at: "2026-04-19T11:00:00Z" },
    ],
  },
  {
    id: "lead-003",
    full_name: "Ibrahim Suleiman",
    email: "ibrahim.s@email.com",
    phone: "+1-555-0103",
    stage: "qualified",
    setter_id: "setter-001",
    closer_id: null,
    application_details: { program: "Quran Memorization", level: "Intermediate" },
    notes: "Has studied before, looking to complete memorization.",
    created_at: "2026-04-15T14:00:00Z",
    updated_at: "2026-04-17T16:00:00Z",
    stage_history: [
      { id: "sh-003a", lead_id: "lead-003", from_stage: null, to_stage: "applied", changed_by: "setter-001", notes: "", created_at: "2026-04-15T14:00:00Z" },
      { id: "sh-003b", lead_id: "lead-003", from_stage: "applied", to_stage: "qualified", changed_by: "setter-001", notes: "Good candidate", created_at: "2026-04-17T16:00:00Z" },
    ],
  },
  {
    id: "lead-004",
    full_name: "Khadija Williams",
    email: "khadija.w@email.com",
    phone: "+1-555-0104",
    stage: "no_show",
    setter_id: "setter-002",
    closer_id: "closer-002",
    application_details: { program: "Tajweed Mastery", level: "Beginner" },
    notes: "Missed first call. Follow up scheduled.",
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-04-14T10:00:00Z",
    stage_history: [
      { id: "sh-004a", lead_id: "lead-004", from_stage: null, to_stage: "applied", changed_by: "setter-002", notes: "", created_at: "2026-04-10T09:00:00Z" },
      { id: "sh-004b", lead_id: "lead-004", from_stage: "applied", to_stage: "booked", changed_by: "setter-002", notes: "", created_at: "2026-04-12T11:00:00Z" },
      { id: "sh-004c", lead_id: "lead-004", from_stage: "booked", to_stage: "no_show", changed_by: "closer-002", notes: "Did not show up", created_at: "2026-04-14T10:00:00Z" },
    ],
  },
  {
    id: "lead-005",
    full_name: "Hassan Ali",
    email: "hassan.ali@email.com",
    phone: "+1-555-0105",
    stage: "applied",
    setter_id: null,
    closer_id: null,
    application_details: { program: "Arabic Foundations", level: "Beginner" },
    notes: "",
    created_at: "2026-04-21T15:00:00Z",
    updated_at: "2026-04-21T15:00:00Z",
    stage_history: [
      { id: "sh-005a", lead_id: "lead-005", from_stage: null, to_stage: "applied", changed_by: "admin-001", notes: "New application", created_at: "2026-04-21T15:00:00Z" },
    ],
  },
  {
    id: "lead-006",
    full_name: "Nour El-Amin",
    email: "nour.e@email.com",
    phone: "+1-555-0106",
    stage: "closed_won",
    setter_id: "setter-001",
    closer_id: "closer-001",
    application_details: { program: "Tajweed Mastery", level: "Intermediate" },
    notes: "Enrolled April 5.",
    created_at: "2026-03-28T10:00:00Z",
    updated_at: "2026-04-05T15:00:00Z",
    stage_history: [
      { id: "sh-006a", lead_id: "lead-006", from_stage: null, to_stage: "applied", changed_by: "setter-001", notes: "", created_at: "2026-03-28T10:00:00Z" },
      { id: "sh-006b", lead_id: "lead-006", from_stage: "applied", to_stage: "booked", changed_by: "setter-001", notes: "", created_at: "2026-04-02T09:00:00Z" },
      { id: "sh-006c", lead_id: "lead-006", from_stage: "booked", to_stage: "closed_won", changed_by: "closer-001", notes: "Paid in full", created_at: "2026-04-05T15:00:00Z" },
    ],
  },
  {
    id: "lead-007",
    full_name: "Zainab Malik",
    email: "zainab.m@email.com",
    phone: "+1-555-0107",
    stage: "closed_won",
    setter_id: "setter-002",
    closer_id: "closer-002",
    application_details: { program: "Quran Memorization", level: "Advanced" },
    notes: "Payment plan - $1,500 down.",
    created_at: "2026-04-06T11:00:00Z",
    updated_at: "2026-04-10T14:00:00Z",
    stage_history: [
      { id: "sh-007a", lead_id: "lead-007", from_stage: null, to_stage: "applied", changed_by: "setter-002", notes: "", created_at: "2026-04-06T11:00:00Z" },
      { id: "sh-007b", lead_id: "lead-007", from_stage: "applied", to_stage: "booked", changed_by: "setter-002", notes: "", created_at: "2026-04-08T10:00:00Z" },
      { id: "sh-007c", lead_id: "lead-007", from_stage: "booked", to_stage: "closed_won", changed_by: "closer-002", notes: "Payment plan agreed", created_at: "2026-04-10T14:00:00Z" },
    ],
  },
  {
    id: "lead-008",
    full_name: "Tariq Rahman",
    email: "tariq.r@email.com",
    phone: "+1-555-0108",
    stage: "closed_lost",
    setter_id: "setter-001",
    closer_id: "closer-002",
    application_details: { program: "Arabic Foundations", level: "Beginner" },
    notes: "Price was too high for their budget right now.",
    created_at: "2026-03-10T10:00:00Z",
    updated_at: "2026-03-20T16:00:00Z",
    stage_history: [
      { id: "sh-008a", lead_id: "lead-008", from_stage: null, to_stage: "applied", changed_by: "setter-001", notes: "", created_at: "2026-03-10T10:00:00Z" },
      { id: "sh-008b", lead_id: "lead-008", from_stage: "applied", to_stage: "booked", changed_by: "setter-001", notes: "", created_at: "2026-03-15T11:00:00Z" },
      { id: "sh-008c", lead_id: "lead-008", from_stage: "booked", to_stage: "closed_lost", changed_by: "closer-002", notes: "Budget objection", created_at: "2026-03-20T16:00:00Z" },
    ],
  },
  // More leads for pipeline variety
  {
    id: "lead-009",
    full_name: "Layla Ahmadi",
    email: "layla.a@email.com",
    phone: "+1-555-0109",
    stage: "booked",
    setter_id: "setter-001",
    closer_id: "closer-001",
    application_details: { program: "Quran Memorization", level: "Beginner" },
    notes: "Call scheduled for Apr 23.",
    created_at: "2026-04-20T09:00:00Z",
    updated_at: "2026-04-21T10:00:00Z",
    stage_history: [
      { id: "sh-009a", lead_id: "lead-009", from_stage: null, to_stage: "applied", changed_by: "setter-001", notes: "", created_at: "2026-04-20T09:00:00Z" },
      { id: "sh-009b", lead_id: "lead-009", from_stage: "applied", to_stage: "booked", changed_by: "setter-001", notes: "Quick to book!", created_at: "2026-04-21T10:00:00Z" },
    ],
  },
  {
    id: "lead-010",
    full_name: "Omar Farouq",
    email: "omar.f@email.com",
    phone: "+1-555-0110",
    stage: "contacted",
    setter_id: "setter-002",
    closer_id: null,
    application_details: { program: "Tajweed Mastery", level: "Zero" },
    notes: "Interested in evening sessions.",
    created_at: "2026-04-19T13:00:00Z",
    updated_at: "2026-04-21T14:00:00Z",
    stage_history: [
      { id: "sh-010a", lead_id: "lead-010", from_stage: null, to_stage: "applied", changed_by: "setter-002", notes: "", created_at: "2026-04-19T13:00:00Z" },
      { id: "sh-010b", lead_id: "lead-010", from_stage: "applied", to_stage: "contacted", changed_by: "setter-002", notes: "Called, left message", created_at: "2026-04-21T14:00:00Z" },
    ],
  },
];

export const MOCK_DEALS: Deal[] = [
  // Jan 2026 - Deal 1: Payment plan, Ahmed closed, Sarah set
  {
    id: "deal-001",
    lead_id: "lead-jan-001",
    setter_id: "setter-001",
    closer_id: "closer-001",
    deal_value: 3000,
    payment_structure: "payment_plan",
    status: "active",
    total_collected: 2500,
    remaining_balance: 500,
    closed_at: "2026-01-10T00:00:00Z",
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  // Feb 2026 - Deal 2: PIF, Ahmed closed, Michael set
  {
    id: "deal-002",
    lead_id: "lead-feb-001",
    setter_id: "setter-002",
    closer_id: "closer-001",
    deal_value: 4500,
    payment_structure: "pif",
    status: "completed",
    total_collected: 4500,
    remaining_balance: 0,
    closed_at: "2026-02-15T00:00:00Z",
    created_at: "2026-02-15T00:00:00Z",
    updated_at: "2026-02-15T00:00:00Z",
  },
  // Feb 2026 - Deal 3: Payment plan, Fatima closed, Sarah set
  {
    id: "deal-003",
    lead_id: "lead-feb-002",
    setter_id: "setter-001",
    closer_id: "closer-002",
    deal_value: 2500,
    payment_structure: "payment_plan",
    status: "active",
    total_collected: 2000,
    remaining_balance: 500,
    closed_at: "2026-02-22T00:00:00Z",
    created_at: "2026-02-22T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
  // March 2026 - Deal 4: PIF, Ahmed closed, Sarah set
  {
    id: "deal-004",
    lead_id: "lead-mar-001",
    setter_id: "setter-001",
    closer_id: "closer-001",
    deal_value: 5000,
    payment_structure: "pif",
    status: "completed",
    total_collected: 5000,
    remaining_balance: 0,
    closed_at: "2026-03-08T00:00:00Z",
    created_at: "2026-03-08T00:00:00Z",
    updated_at: "2026-03-08T00:00:00Z",
  },
  // March 2026 - Deal 5: Payment plan, Fatima closed, Michael set
  {
    id: "deal-005",
    lead_id: "lead-mar-002",
    setter_id: "setter-002",
    closer_id: "closer-002",
    deal_value: 3500,
    payment_structure: "payment_plan",
    status: "active",
    total_collected: 1875,
    remaining_balance: 1625,
    closed_at: "2026-03-18T00:00:00Z",
    created_at: "2026-03-18T00:00:00Z",
    updated_at: "2026-04-12T00:00:00Z",
  },
  // April 2026 - Deal 6: PIF, Ahmed closed, Sarah set (Nour lead)
  {
    id: "deal-006",
    lead_id: "lead-006",
    setter_id: "setter-001",
    closer_id: "closer-001",
    deal_value: 4000,
    payment_structure: "pif",
    status: "completed",
    total_collected: 4000,
    remaining_balance: 0,
    closed_at: "2026-04-05T00:00:00Z",
    created_at: "2026-04-05T00:00:00Z",
    updated_at: "2026-04-05T00:00:00Z",
  },
  // April 2026 - Deal 7: Payment plan, Fatima closed, Michael set (Zainab lead)
  {
    id: "deal-007",
    lead_id: "lead-007",
    setter_id: "setter-002",
    closer_id: "closer-002",
    deal_value: 6000,
    payment_structure: "payment_plan",
    status: "active",
    total_collected: 1500,
    remaining_balance: 4500,
    closed_at: "2026-04-10T00:00:00Z",
    created_at: "2026-04-10T00:00:00Z",
    updated_at: "2026-04-10T00:00:00Z",
  },
  // April 2026 - Deal 8: PIF, Ahmed closed, Sarah set
  {
    id: "deal-008",
    lead_id: "lead-apr-001",
    setter_id: "setter-001",
    closer_id: "closer-001",
    deal_value: 2800,
    payment_structure: "pif",
    status: "completed",
    total_collected: 2800,
    remaining_balance: 0,
    closed_at: "2026-04-18T00:00:00Z",
    created_at: "2026-04-18T00:00:00Z",
    updated_at: "2026-04-18T00:00:00Z",
  },
  // March 2026 - Deal 9: Payment plan overdue, Ahmed closed, Michael set
  {
    id: "deal-009",
    lead_id: "lead-mar-003",
    setter_id: "setter-002",
    closer_id: "closer-001",
    deal_value: 2000,
    payment_structure: "payment_plan",
    status: "overdue",
    total_collected: 600,
    remaining_balance: 1400,
    closed_at: "2026-03-25T00:00:00Z",
    created_at: "2026-03-25T00:00:00Z",
    updated_at: "2026-04-01T00:00:00Z",
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  // Deal 1 payments (Jan 2026 payment plan)
  { id: "pay-001", deal_id: "deal-001", amount: 1000, payment_date: "2026-01-10", payment_type: "installment", notes: "Down payment", recorded_by: "admin-001", created_at: "2026-01-10T00:00:00Z" },
  { id: "pay-002", deal_id: "deal-001", amount: 500, payment_date: "2026-02-10", payment_type: "installment", notes: "Month 2", recorded_by: "admin-001", created_at: "2026-02-10T00:00:00Z" },
  { id: "pay-003", deal_id: "deal-001", amount: 500, payment_date: "2026-03-10", payment_type: "installment", notes: "Month 3", recorded_by: "admin-001", created_at: "2026-03-10T00:00:00Z" },
  { id: "pay-004", deal_id: "deal-001", amount: 500, payment_date: "2026-04-10", payment_type: "installment", notes: "Month 4", recorded_by: "admin-001", created_at: "2026-04-10T00:00:00Z" },

  // Deal 2 payments (Feb 2026 PIF)
  { id: "pay-005", deal_id: "deal-002", amount: 4500, payment_date: "2026-02-15", payment_type: "pif", notes: "Paid in full", recorded_by: "admin-001", created_at: "2026-02-15T00:00:00Z" },

  // Deal 3 payments (Feb 2026 payment plan)
  { id: "pay-006", deal_id: "deal-003", amount: 800, payment_date: "2026-02-22", payment_type: "installment", notes: "Down payment", recorded_by: "admin-001", created_at: "2026-02-22T00:00:00Z" },
  { id: "pay-007", deal_id: "deal-003", amount: 600, payment_date: "2026-03-22", payment_type: "installment", notes: "Month 2", recorded_by: "admin-001", created_at: "2026-03-22T00:00:00Z" },
  { id: "pay-008", deal_id: "deal-003", amount: 600, payment_date: "2026-04-14", payment_type: "installment", notes: "Month 3", recorded_by: "admin-001", created_at: "2026-04-14T00:00:00Z" },

  // Deal 4 payments (March 2026 PIF)
  { id: "pay-009", deal_id: "deal-004", amount: 5000, payment_date: "2026-03-08", payment_type: "pif", notes: "Paid in full", recorded_by: "admin-001", created_at: "2026-03-08T00:00:00Z" },

  // Deal 5 payments (March 2026 payment plan)
  { id: "pay-010", deal_id: "deal-005", amount: 1000, payment_date: "2026-03-18", payment_type: "installment", notes: "Down payment", recorded_by: "admin-001", created_at: "2026-03-18T00:00:00Z" },
  { id: "pay-011", deal_id: "deal-005", amount: 875, payment_date: "2026-04-12", payment_type: "installment", notes: "Month 2", recorded_by: "admin-001", created_at: "2026-04-12T00:00:00Z" },

  // Deal 6 payments (April 2026 PIF)
  { id: "pay-012", deal_id: "deal-006", amount: 4000, payment_date: "2026-04-05", payment_type: "pif", notes: "Paid in full", recorded_by: "closer-001", created_at: "2026-04-05T00:00:00Z" },

  // Deal 7 payments (April 2026 payment plan)
  { id: "pay-013", deal_id: "deal-007", amount: 1500, payment_date: "2026-04-10", payment_type: "installment", notes: "Down payment", recorded_by: "closer-002", created_at: "2026-04-10T00:00:00Z" },

  // Deal 8 payments (April 2026 PIF)
  { id: "pay-014", deal_id: "deal-008", amount: 2800, payment_date: "2026-04-18", payment_type: "pif", notes: "Paid in full", recorded_by: "closer-001", created_at: "2026-04-18T00:00:00Z" },

  // Deal 9 payments (March 2026 payment plan - overdue)
  { id: "pay-015", deal_id: "deal-009", amount: 600, payment_date: "2026-03-25", payment_type: "installment", notes: "Down payment", recorded_by: "admin-001", created_at: "2026-03-25T00:00:00Z" },
];

export const MOCK_COMMISSIONS: Commission[] = [
  // Feb commissions (already paid)
  { id: "comm-001", payment_id: "pay-005", team_member_id: "closer-001", role: "closer", commission_type: "monthly", amount: 450, rate: 0.10, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-02-01", pay_period_end: "2026-02-28", created_at: "2026-02-28T00:00:00Z", updated_at: "2026-03-05T00:00:00Z" },
  { id: "comm-002", payment_id: "pay-005", team_member_id: "setter-002", role: "setter", commission_type: "monthly", amount: 225, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-02-01", pay_period_end: "2026-02-28", created_at: "2026-02-28T00:00:00Z", updated_at: "2026-03-05T00:00:00Z" },
  { id: "comm-003", payment_id: "pay-006", team_member_id: "closer-002", role: "closer", commission_type: "monthly", amount: 80, rate: 0.10, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-02-01", pay_period_end: "2026-02-28", created_at: "2026-02-28T00:00:00Z", updated_at: "2026-03-05T00:00:00Z" },
  { id: "comm-004", payment_id: "pay-006", team_member_id: "setter-001", role: "setter", commission_type: "monthly", amount: 40, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-02-01", pay_period_end: "2026-02-28", created_at: "2026-02-28T00:00:00Z", updated_at: "2026-03-05T00:00:00Z" },
  // Feb biweekly for setter-001 (already paid)
  { id: "comm-005", payment_id: "pay-002", team_member_id: "setter-001", role: "setter", commission_type: "biweekly", amount: 25, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-02-01", pay_period_end: "2026-02-14", created_at: "2026-02-15T00:00:00Z", updated_at: "2026-02-16T00:00:00Z" },

  // March commissions (already paid)
  { id: "comm-006", payment_id: "pay-009", team_member_id: "closer-001", role: "closer", commission_type: "monthly", amount: 500, rate: 0.10, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-31", created_at: "2026-03-31T00:00:00Z", updated_at: "2026-04-05T00:00:00Z" },
  { id: "comm-007", payment_id: "pay-009", team_member_id: "setter-001", role: "setter", commission_type: "monthly", amount: 250, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-31", created_at: "2026-03-31T00:00:00Z", updated_at: "2026-04-05T00:00:00Z" },
  { id: "comm-008", payment_id: "pay-010", team_member_id: "closer-002", role: "closer", commission_type: "monthly", amount: 100, rate: 0.10, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-31", created_at: "2026-03-31T00:00:00Z", updated_at: "2026-04-05T00:00:00Z" },
  { id: "comm-009", payment_id: "pay-010", team_member_id: "setter-002", role: "setter", commission_type: "monthly", amount: 50, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-31", created_at: "2026-03-31T00:00:00Z", updated_at: "2026-04-05T00:00:00Z" },
  { id: "comm-010", payment_id: "pay-015", team_member_id: "closer-001", role: "closer", commission_type: "monthly", amount: 60, rate: 0.10, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-31", created_at: "2026-03-31T00:00:00Z", updated_at: "2026-04-05T00:00:00Z" },
  { id: "comm-011", payment_id: "pay-015", team_member_id: "setter-002", role: "setter", commission_type: "monthly", amount: 30, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-31", created_at: "2026-03-31T00:00:00Z", updated_at: "2026-04-05T00:00:00Z" },
  // March biweekly (paid)
  { id: "comm-012", payment_id: "pay-003", team_member_id: "setter-001", role: "setter", commission_type: "biweekly", amount: 25, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-01", pay_period_end: "2026-03-14", created_at: "2026-03-14T00:00:00Z", updated_at: "2026-03-16T00:00:00Z" },
  { id: "comm-013", payment_id: "pay-007", team_member_id: "setter-001", role: "setter", commission_type: "biweekly", amount: 30, rate: 0.05, status: "paid", override_amount: null, override_reason: null, pay_period_start: "2026-03-15", pay_period_end: "2026-03-28", created_at: "2026-03-28T00:00:00Z", updated_at: "2026-03-30T00:00:00Z" },

  // April commissions (pending/approved - current month)
  // Deal 1 April installment → closer Ahmed + setter Sarah (catch-up, deal from Jan)
  { id: "comm-014", payment_id: "pay-004", team_member_id: "closer-001", role: "closer", commission_type: "monthly", amount: 50, rate: 0.10, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-10T00:00:00Z", updated_at: "2026-04-10T00:00:00Z" },
  { id: "comm-015", payment_id: "pay-004", team_member_id: "setter-001", role: "setter", commission_type: "catchup", amount: 25, rate: 0.05, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-10T00:00:00Z", updated_at: "2026-04-10T00:00:00Z" },
  // Deal 3 April installment → closer Fatima + setter Sarah (catch-up, deal from Feb)
  { id: "comm-016", payment_id: "pay-008", team_member_id: "closer-002", role: "closer", commission_type: "monthly", amount: 60, rate: 0.10, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-14T00:00:00Z", updated_at: "2026-04-14T00:00:00Z" },
  { id: "comm-017", payment_id: "pay-008", team_member_id: "setter-001", role: "setter", commission_type: "catchup", amount: 30, rate: 0.05, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-14T00:00:00Z", updated_at: "2026-04-14T00:00:00Z" },
  // Deal 5 April installment → closer Fatima + setter Michael (catch-up, deal from March)
  { id: "comm-018", payment_id: "pay-011", team_member_id: "closer-002", role: "closer", commission_type: "monthly", amount: 87.5, rate: 0.10, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-12T00:00:00Z", updated_at: "2026-04-12T00:00:00Z" },
  { id: "comm-019", payment_id: "pay-011", team_member_id: "setter-002", role: "setter", commission_type: "catchup", amount: 43.75, rate: 0.05, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-12T00:00:00Z", updated_at: "2026-04-12T00:00:00Z" },
  // Deal 6 April PIF → closer Ahmed + setter Sarah (regular, current month deal)
  { id: "comm-020", payment_id: "pay-012", team_member_id: "closer-001", role: "closer", commission_type: "monthly", amount: 400, rate: 0.10, status: "approved", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-05T00:00:00Z", updated_at: "2026-04-06T00:00:00Z" },
  { id: "comm-021", payment_id: "pay-012", team_member_id: "setter-001", role: "setter", commission_type: "biweekly", amount: 200, rate: 0.05, status: "approved", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-14", created_at: "2026-04-05T00:00:00Z", updated_at: "2026-04-06T00:00:00Z" },
  // Deal 7 April down → closer Fatima + setter Michael (regular, current month)
  { id: "comm-022", payment_id: "pay-013", team_member_id: "closer-002", role: "closer", commission_type: "monthly", amount: 150, rate: 0.10, status: "approved", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-10T00:00:00Z", updated_at: "2026-04-11T00:00:00Z" },
  { id: "comm-023", payment_id: "pay-013", team_member_id: "setter-002", role: "setter", commission_type: "biweekly", amount: 75, rate: 0.05, status: "approved", override_amount: null, override_reason: null, pay_period_start: "2026-04-08", pay_period_end: "2026-04-22", created_at: "2026-04-10T00:00:00Z", updated_at: "2026-04-11T00:00:00Z" },
  // Deal 8 April PIF → closer Ahmed + setter Sarah (regular, current month)
  { id: "comm-024", payment_id: "pay-014", team_member_id: "closer-001", role: "closer", commission_type: "monthly", amount: 280, rate: 0.10, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-01", pay_period_end: "2026-04-30", created_at: "2026-04-18T00:00:00Z", updated_at: "2026-04-18T00:00:00Z" },
  { id: "comm-025", payment_id: "pay-014", team_member_id: "setter-001", role: "setter", commission_type: "biweekly", amount: 140, rate: 0.05, status: "pending", override_amount: null, override_reason: null, pay_period_start: "2026-04-08", pay_period_end: "2026-04-22", created_at: "2026-04-18T00:00:00Z", updated_at: "2026-04-18T00:00:00Z" },
];

export const MOCK_PAYOUT_PERIODS: PayoutPeriod[] = [
  { id: "pp-001", period_type: "biweekly", start_date: "2026-02-01", end_date: "2026-02-14", total_amount: 25, status: "completed", created_at: "2026-02-01T00:00:00Z" },
  { id: "pp-002", period_type: "monthly", start_date: "2026-02-01", end_date: "2026-02-28", total_amount: 795, status: "completed", created_at: "2026-02-01T00:00:00Z" },
  { id: "pp-003", period_type: "biweekly", start_date: "2026-03-01", end_date: "2026-03-14", total_amount: 25, status: "completed", created_at: "2026-03-01T00:00:00Z" },
  { id: "pp-004", period_type: "biweekly", start_date: "2026-03-15", end_date: "2026-03-28", total_amount: 30, status: "completed", created_at: "2026-03-15T00:00:00Z" },
  { id: "pp-005", period_type: "monthly", start_date: "2026-03-01", end_date: "2026-03-31", total_amount: 1015, status: "completed", created_at: "2026-03-01T00:00:00Z" },
  { id: "pp-006", period_type: "biweekly", start_date: "2026-04-01", end_date: "2026-04-14", total_amount: 275, status: "completed", created_at: "2026-04-01T00:00:00Z" },
  { id: "pp-007", period_type: "biweekly", start_date: "2026-04-08", end_date: "2026-04-22", total_amount: 215, status: "pending", created_at: "2026-04-08T00:00:00Z" },
  { id: "pp-008", period_type: "monthly", start_date: "2026-04-01", end_date: "2026-04-30", total_amount: 1265.25, status: "pending", created_at: "2026-04-01T00:00:00Z" },
];

export const MOCK_PAYOUT_HISTORY: PayoutHistory[] = [
  // Feb payouts
  { id: "ph-001", team_member_id: "closer-001", payout_period_id: "pp-002", amount: 450, paid_at: "2026-03-01T00:00:00Z", notes: "Feb monthly payout", created_by: "admin-001" },
  { id: "ph-002", team_member_id: "setter-002", payout_period_id: "pp-002", amount: 225, paid_at: "2026-03-01T00:00:00Z", notes: "Feb monthly payout", created_by: "admin-001" },
  { id: "ph-003", team_member_id: "closer-002", payout_period_id: "pp-002", amount: 80, paid_at: "2026-03-01T00:00:00Z", notes: "Feb monthly payout", created_by: "admin-001" },
  { id: "ph-004", team_member_id: "setter-001", payout_period_id: "pp-002", amount: 40, paid_at: "2026-03-01T00:00:00Z", notes: "Feb monthly payout", created_by: "admin-001" },
  { id: "ph-005", team_member_id: "setter-001", payout_period_id: "pp-001", amount: 25, paid_at: "2026-02-15T00:00:00Z", notes: "Feb biweekly", created_by: "admin-001" },
  // March payouts
  { id: "ph-006", team_member_id: "closer-001", payout_period_id: "pp-005", amount: 560, paid_at: "2026-04-05T00:00:00Z", notes: "March monthly payout", created_by: "admin-001" },
  { id: "ph-007", team_member_id: "setter-001", payout_period_id: "pp-005", amount: 250, paid_at: "2026-04-05T00:00:00Z", notes: "March monthly payout", created_by: "admin-001" },
  { id: "ph-008", team_member_id: "closer-002", payout_period_id: "pp-005", amount: 100, paid_at: "2026-04-05T00:00:00Z", notes: "March monthly payout", created_by: "admin-001" },
  { id: "ph-009", team_member_id: "setter-002", payout_period_id: "pp-005", amount: 80, paid_at: "2026-04-05T00:00:00Z", notes: "March monthly payout", created_by: "admin-001" },
  { id: "ph-010", team_member_id: "setter-001", payout_period_id: "pp-003", amount: 25, paid_at: "2026-03-14T00:00:00Z", notes: "March 1st biweekly", created_by: "admin-001" },
  { id: "ph-011", team_member_id: "setter-001", payout_period_id: "pp-004", amount: 30, paid_at: "2026-03-28T00:00:00Z", notes: "March 2nd biweekly", created_by: "admin-001" },
  // April first biweekly (paid Apr 14)
  { id: "ph-012", team_member_id: "setter-001", payout_period_id: "pp-006", amount: 200, paid_at: "2026-04-14T00:00:00Z", notes: "April 1st biweekly", created_by: "admin-001" },
  { id: "ph-013", team_member_id: "setter-002", payout_period_id: "pp-006", amount: 75, paid_at: "2026-04-14T00:00:00Z", notes: "April 1st biweekly", created_by: "admin-001" },
];
