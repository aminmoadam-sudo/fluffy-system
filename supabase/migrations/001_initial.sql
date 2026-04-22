-- Bayaan Sales Commission OS - Initial Schema

-- Team members (setters, closers, admins)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'setter', 'closer')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads (CRM pipeline)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  stage TEXT NOT NULL DEFAULT 'applied' CHECK (stage IN ('applied', 'qualified', 'contacted', 'booked', 'no_show', 'closed_won', 'closed_lost')),
  setter_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  closer_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  application_details JSONB,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead stage history (timeline)
CREATE TABLE IF NOT EXISTS lead_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals (closed sales)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  setter_id UUID NOT NULL REFERENCES team_members(id),
  closer_id UUID NOT NULL REFERENCES team_members(id),
  deal_value DECIMAL(10,2) NOT NULL,
  payment_structure TEXT NOT NULL CHECK (payment_structure IN ('pif', 'payment_plan')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
  total_collected DECIMAL(10,2) DEFAULT 0,
  remaining_balance DECIMAL(10,2),
  closed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments (individual payment events)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('pif', 'installment', 'partial')),
  notes TEXT DEFAULT '',
  recorded_by UUID REFERENCES team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions (generated from payments)
CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES team_members(id),
  role TEXT NOT NULL CHECK (role IN ('setter', 'closer')),
  commission_type TEXT NOT NULL CHECK (commission_type IN ('biweekly', 'monthly', 'catchup')),
  amount DECIMAL(10,2) NOT NULL,
  rate DECIMAL(4,3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  override_amount DECIMAL(10,2),
  override_reason TEXT,
  pay_period_start DATE,
  pay_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout periods
CREATE TABLE IF NOT EXISTS payout_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_type TEXT NOT NULL CHECK (period_type IN ('biweekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout history (actual payouts made)
CREATE TABLE IF NOT EXISTS payout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID NOT NULL REFERENCES team_members(id),
  payout_period_id UUID REFERENCES payout_periods(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES team_members(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_setter ON leads(setter_id);
CREATE INDEX IF NOT EXISTS idx_leads_closer ON leads(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_setter ON deals(setter_id);
CREATE INDEX IF NOT EXISTS idx_deals_closer ON deals(closer_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON deals(status);
CREATE INDEX IF NOT EXISTS idx_payments_deal ON payments(deal_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_commissions_member ON commissions(team_member_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_payment ON commissions(payment_id);
CREATE INDEX IF NOT EXISTS idx_payout_history_member ON payout_history(team_member_id);

-- Row Level Security
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_history ENABLE ROW LEVEL SECURITY;

-- Policies (all authenticated users can read; admin can write)
CREATE POLICY "Authenticated users can read team_members" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage team_members" ON team_members FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Authenticated users can read leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage leads" ON leads FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read deals" ON deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage deals" ON deals FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage payments" ON payments FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can read commissions" ON commissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage commissions" ON commissions FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Authenticated users can read payout_periods" ON payout_periods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage payout_periods" ON payout_periods FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Authenticated users can read payout_history" ON payout_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage payout_history" ON payout_history FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
