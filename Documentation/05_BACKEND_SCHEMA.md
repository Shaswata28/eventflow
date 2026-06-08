# Backend Schema
## EventFlow — Internal Event Management System
**Version:** 1.0  
**Date:** June 2026  
**Database:** PostgreSQL via Supabase  

---

## 1. Schema Overview

```
user_profiles          ← extends Supabase auth.users
clients                ← root entity, one per client family
  └─ consultation_notes ← rich-text notes per client
  └─ event_programs    ← one per program (Holud, Reception, etc.)
       └─ service_categories  ← budget per service per program
            └─ vendor_assignments  ← vendor linked to service
                 └─ approval_requests  ← approval chain per assignment
                 └─ documents          ← bills, receipts per assignment
       └─ event_checklists     ← tasks for event day
       └─ documents            ← contracts, agreements per program

vendors                ← reusable vendor directory
activity_log           ← append-only event log (audit trail)
quotations             ← per-program cost estimate
quotation_items        ← line items within quotation
```

---

## 2. Full SQL Schema

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'managing_director',
  'finance_manager',
  'client_comms',
  'vendor_manager',
  'operations',
  'decoration',
  'design'
);

CREATE TYPE client_status AS ENUM (
  'lead',
  'consultation',
  'confirmed',
  'completed',
  'archived'
);

CREATE TYPE event_type AS ENUM (
  'wedding',
  'corporate',
  'birthday',
  'other'
);

CREATE TYPE program_name_type AS ENUM (
  'holud',
  'mehendi',
  'reception',
  'engagement',
  'corporate',
  'birthday',
  'custom'
);

CREATE TYPE program_status AS ENUM (
  'planning',
  'vendors_sourcing',
  'vendors_confirmed',
  'ready',
  'live',
  'completed',
  'cancelled'
);

CREATE TYPE quotation_status AS ENUM (
  'draft',
  'internal_review',
  'sent_to_client',
  'approved',
  'rejected'
);

CREATE TYPE assignment_status AS ENUM (
  'pending_approval',
  'approved',
  'confirmed',
  'paid',
  'completed',
  'rejected'
);

CREATE TYPE approval_level AS ENUM (
  'finance',
  'md'
);

CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE document_label AS ENUM (
  'bill',
  'receipt',
  'contract',
  'quotation',
  'agreement',
  'reference',
  'other'
);

CREATE TYPE task_priority AS ENUM (
  'high',
  'normal',
  'low'
);

CREATE TYPE vendor_category AS ENUM (
  'decor',
  'catering',
  'photography',
  'cinematography',
  'sound',
  'lighting',
  'flowers',
  'transport',
  'printing',
  'venue',
  'other'
);


-- ============================================================
-- USER PROFILES
-- Extends Supabase auth.users with role and display info
-- ============================================================

CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  role          user_role NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'One row per system user (7 partners). Extends auth.users.';


-- ============================================================
-- CLIENTS
-- Root entity. One per client family or organization.
-- ============================================================

CREATE TABLE clients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_code       TEXT NOT NULL UNIQUE,   -- e.g. CL-031, auto-generated
  full_name         TEXT NOT NULL,          -- family or organization name
  bride_name        TEXT,
  groom_name        TEXT,
  phone_primary     TEXT NOT NULL,
  phone_secondary   TEXT,
  email             TEXT,
  event_type        event_type NOT NULL,
  budget_range      TEXT,                   -- e.g. "12–15 lakh"
  status            client_status NOT NULL DEFAULT 'lead',
  assigned_to       UUID REFERENCES user_profiles(id),
  created_by        UUID NOT NULL REFERENCES user_profiles(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_assigned_to ON clients(assigned_to);
CREATE INDEX idx_clients_client_code ON clients(client_code);

COMMENT ON TABLE clients IS 'One row per client family or organization.';
COMMENT ON COLUMN clients.client_code IS 'Auto-generated human-readable ID. Format: CL-XXX.';


-- Auto-generate client_code (CL-001, CL-002, ...)
CREATE SEQUENCE client_code_seq START 1;

CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.client_code := 'CL-' || LPAD(NEXTVAL('client_code_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_client_code
  BEFORE INSERT ON clients
  FOR EACH ROW
  WHEN (NEW.client_code IS NULL)
  EXECUTE FUNCTION generate_client_code();


-- ============================================================
-- CONSULTATION NOTES
-- Rich-text notes attached to a client. Append-only log.
-- ============================================================

CREATE TABLE consultation_notes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,              -- Tiptap JSON or HTML
  content_type  TEXT NOT NULL DEFAULT 'tiptap_json',
  author_id     UUID NOT NULL REFERENCES user_profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_client_id ON consultation_notes(client_id);

COMMENT ON TABLE consultation_notes IS 'Rich-text consultation notes per client. Multiple notes per client (log-style).';


-- ============================================================
-- EVENT PROGRAMS
-- One per event program (Holud, Reception, etc.) per client.
-- ============================================================

CREATE TABLE event_programs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id           UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  program_name        program_name_type NOT NULL,
  custom_name         TEXT,                 -- used if program_name = 'custom'
  event_date          DATE NOT NULL,
  venue_name          TEXT,
  venue_address       TEXT,
  guest_count         INTEGER,
  theme_notes         TEXT,
  responsible_partner UUID REFERENCES user_profiles(id),
  status              program_status NOT NULL DEFAULT 'planning',
  created_by          UUID NOT NULL REFERENCES user_profiles(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_programs_client_id ON event_programs(client_id);
CREATE INDEX idx_programs_event_date ON event_programs(event_date);
CREATE INDEX idx_programs_status ON event_programs(status);

COMMENT ON TABLE event_programs IS 'Each program is an independent operational unit. All vendors, budgets, and checklists attach here.';


-- ============================================================
-- QUOTATIONS
-- Per-program cost estimate. Separate from vendor assignments.
-- ============================================================

CREATE TABLE quotations (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id    UUID NOT NULL REFERENCES event_programs(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL DEFAULT 1,
  status        quotation_status NOT NULL DEFAULT 'draft',
  total_amount  NUMERIC(12, 2),            -- computed from items, stored for quick read
  advance_amount NUMERIC(12, 2),
  notes         TEXT,
  created_by    UUID NOT NULL REFERENCES user_profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quotation_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id    UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  category        vendor_category NOT NULL,
  description     TEXT,
  amount          NUMERIC(12, 2) NOT NULL,
  sort_order      INTEGER DEFAULT 0
);

CREATE INDEX idx_quotations_program_id ON quotations(program_id);

COMMENT ON TABLE quotations IS 'Cost estimate per program. Becomes basis for budget allocation after client approval.';


-- ============================================================
-- SERVICE CATEGORIES
-- Per-program budget allocation per service. Created from quotation.
-- ============================================================

CREATE TABLE service_categories (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id        UUID NOT NULL REFERENCES event_programs(id) ON DELETE CASCADE,
  category          vendor_category NOT NULL,
  custom_label      TEXT,                   -- optional override label
  allocated_budget  NUMERIC(12, 2) NOT NULL,
  assigned_to       UUID REFERENCES user_profiles(id),
  status            TEXT NOT NULL DEFAULT 'sourcing',
                    -- sourcing | vendor_found | confirmed | completed
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_categories_program_id ON service_categories(program_id);
CREATE INDEX idx_service_categories_assigned_to ON service_categories(assigned_to);

COMMENT ON TABLE service_categories IS 'One row per service per program. Drives vendor sourcing and budget tracking.';


-- ============================================================
-- VENDORS
-- Reusable directory of all vendors.
-- ============================================================

CREATE TABLE vendors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  category        vendor_category NOT NULL,
  phone_primary   TEXT,
  phone_secondary TEXT,
  location        TEXT,
  area            TEXT,
  last_used_price NUMERIC(12, 2),
  rating          NUMERIC(2, 1) CHECK (rating >= 1 AND rating <= 5),
  notes           TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  added_by        UUID REFERENCES user_profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_is_active ON vendors(is_active);

COMMENT ON TABLE vendors IS 'Reusable vendor directory. Shared across all programs and events.';


-- ============================================================
-- VENDOR ASSIGNMENTS
-- Links a vendor to a service category for a specific program.
-- ============================================================

CREATE TABLE vendor_assignments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_category_id   UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  vendor_id             UUID REFERENCES vendors(id),
  vendor_name_override  TEXT,               -- if vendor not in DB
  vendor_phone_override TEXT,
  quoted_price          NUMERIC(12, 2) NOT NULL,
  advance_paid          NUMERIC(12, 2) DEFAULT 0,
  remaining_balance     NUMERIC(12, 2) GENERATED ALWAYS AS (quoted_price - advance_paid) STORED,
  status                assignment_status NOT NULL DEFAULT 'pending_approval',
  notes                 TEXT,
  requested_by          UUID NOT NULL REFERENCES user_profiles(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assignments_service_category ON vendor_assignments(service_category_id);
CREATE INDEX idx_assignments_vendor_id ON vendor_assignments(vendor_id);
CREATE INDEX idx_assignments_status ON vendor_assignments(status);

COMMENT ON TABLE vendor_assignments IS 'Links a vendor to a service category for a specific program. Triggers approval if above threshold.';


-- ============================================================
-- APPROVAL REQUESTS
-- One row per approval step per vendor assignment.
-- ============================================================

CREATE TABLE approval_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_assignment_id  UUID NOT NULL REFERENCES vendor_assignments(id) ON DELETE CASCADE,
  approval_level        approval_level NOT NULL,       -- 'finance' or 'md'
  approver_id           UUID NOT NULL REFERENCES user_profiles(id),
  status                approval_status NOT NULL DEFAULT 'pending',
  note                  TEXT,                           -- required on both approve and reject
  requested_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at           TIMESTAMPTZ
);

CREATE INDEX idx_approvals_assignment_id ON approval_requests(vendor_assignment_id);
CREATE INDEX idx_approvals_approver_id ON approval_requests(approver_id);
CREATE INDEX idx_approvals_status ON approval_requests(status);

COMMENT ON TABLE approval_requests IS 'One row per approval tier per vendor assignment. Resolved_at is set on approve or reject.';


-- ============================================================
-- DOCUMENTS
-- Files attached to vendor assignments or programs.
-- ============================================================

CREATE TABLE documents (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_assignment_id  UUID REFERENCES vendor_assignments(id) ON DELETE CASCADE,
  program_id            UUID REFERENCES event_programs(id) ON DELETE CASCADE,
  client_id             UUID REFERENCES clients(id) ON DELETE CASCADE,
  label                 document_label NOT NULL DEFAULT 'other',
  file_name             TEXT NOT NULL,
  file_url              TEXT NOT NULL,                 -- Supabase Storage path
  file_type             TEXT NOT NULL,                 -- MIME type
  file_size_bytes       INTEGER,
  uploaded_by           UUID NOT NULL REFERENCES user_profiles(id),
  uploaded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT document_must_have_parent CHECK (
    vendor_assignment_id IS NOT NULL OR
    program_id IS NOT NULL OR
    client_id IS NOT NULL
  )
);

CREATE INDEX idx_documents_assignment ON documents(vendor_assignment_id);
CREATE INDEX idx_documents_program ON documents(program_id);
CREATE INDEX idx_documents_client ON documents(client_id);

COMMENT ON TABLE documents IS 'File attachments. Must be linked to at least one parent entity.';


-- ============================================================
-- EVENT CHECKLISTS
-- Task-level checklist per program. Used live on event day.
-- ============================================================

CREATE TABLE event_checklists (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id    UUID NOT NULL REFERENCES event_programs(id) ON DELETE CASCADE,
  department    TEXT NOT NULL,              -- 'decoration', 'catering', 'logistics', etc.
  task_title    TEXT NOT NULL,
  priority      task_priority NOT NULL DEFAULT 'normal',
  assigned_to   UUID REFERENCES user_profiles(id),
  due_time      TIMETZ,                     -- time of day (not datetime)
  is_done       BOOLEAN NOT NULL DEFAULT false,
  done_by       UUID REFERENCES user_profiles(id),
  done_at       TIMESTAMPTZ,
  flag_note     TEXT,                       -- optional flag/issue note
  sort_order    INTEGER DEFAULT 0,
  created_by    UUID NOT NULL REFERENCES user_profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_checklist_program_id ON event_checklists(program_id);
CREATE INDEX idx_checklist_assigned_to ON event_checklists(assigned_to);
CREATE INDEX idx_checklist_is_done ON event_checklists(is_done);

COMMENT ON TABLE event_checklists IS 'Task checklist per program. Updated in real time on event day via Supabase Realtime.';


-- ============================================================
-- ACTIVITY LOG
-- Append-only audit trail of all meaningful system events.
-- ============================================================

CREATE TABLE activity_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id      UUID REFERENCES user_profiles(id),
  entity_type   TEXT NOT NULL,             -- 'client', 'program', 'vendor_assignment', etc.
  entity_id     UUID NOT NULL,
  action        TEXT NOT NULL,             -- 'created', 'approved', 'confirmed', 'ticked', etc.
  description   TEXT NOT NULL,             -- human-readable e.g. "Avraw approved Royal Kitchen BD"
  metadata      JSONB,                     -- optional extra data
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

COMMENT ON TABLE activity_log IS 'Immutable audit log. Never update or delete rows. Source of truth for activity feeds.';


-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;


-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- user_profiles: all authenticated users can read their own; MD can read all
CREATE POLICY "profiles_read_own" ON user_profiles
  FOR SELECT USING (id = auth.uid() OR get_user_role() = 'managing_director');

CREATE POLICY "profiles_update_own" ON user_profiles
  FOR UPDATE USING (id = auth.uid());


-- clients: all authenticated can read; only MD and client_comms can write
CREATE POLICY "clients_read_all" ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "clients_insert" ON clients
  FOR INSERT WITH CHECK (
    get_user_role() IN ('managing_director', 'client_comms')
  );

CREATE POLICY "clients_update" ON clients
  FOR UPDATE USING (
    get_user_role() IN ('managing_director', 'client_comms')
  );


-- consultation_notes: all can read; only MD and client_comms can write
CREATE POLICY "notes_read_all" ON consultation_notes
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "notes_write" ON consultation_notes
  FOR INSERT WITH CHECK (
    get_user_role() IN ('managing_director', 'client_comms')
  );


-- event_programs: all can read; MD and client_comms can write
CREATE POLICY "programs_read_all" ON event_programs
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "programs_write" ON event_programs
  FOR ALL USING (
    get_user_role() IN ('managing_director', 'client_comms')
  );


-- service_categories: all can read; MD, client_comms, vendor_manager, decoration can write
CREATE POLICY "service_categories_read_all" ON service_categories
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "service_categories_write" ON service_categories
  FOR ALL USING (
    get_user_role() IN ('managing_director', 'client_comms', 'vendor_manager', 'decoration')
  );


-- vendors: all can read; vendor_manager, decoration, MD can write
CREATE POLICY "vendors_read_all" ON vendors
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "vendors_write" ON vendors
  FOR ALL USING (
    get_user_role() IN ('managing_director', 'vendor_manager', 'decoration')
  );


-- vendor_assignments: all can read; vendor_manager, decoration, MD can write
CREATE POLICY "assignments_read_all" ON vendor_assignments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "assignments_write" ON vendor_assignments
  FOR ALL USING (
    get_user_role() IN ('managing_director', 'vendor_manager', 'decoration')
  );


-- approval_requests: all can read; only finance_manager and MD can resolve
CREATE POLICY "approvals_read_all" ON approval_requests
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "approvals_insert" ON approval_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "approvals_update" ON approval_requests
  FOR UPDATE USING (
    get_user_role() IN ('managing_director', 'finance_manager')
  );


-- event_checklists: all can read and update (tick tasks)
CREATE POLICY "checklist_read_all" ON event_checklists
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "checklist_update_all" ON event_checklists
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "checklist_insert" ON event_checklists
  FOR INSERT WITH CHECK (
    get_user_role() IN ('managing_director', 'operations', 'decoration')
  );


-- activity_log: all can read; insert only (no update/delete)
CREATE POLICY "activity_read_all" ON activity_log
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "activity_insert_all" ON activity_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- Enable Realtime for event-day and notification features
-- ============================================================

-- Run in Supabase Dashboard → Database → Replication
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE event_checklists;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE approval_requests;


-- ============================================================
-- UPDATED_AT AUTO-UPDATE TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_programs_updated_at BEFORE UPDATE ON event_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assignments_updated_at BEFORE UPDATE ON vendor_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_checklist_updated_at BEFORE UPDATE ON event_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 3. Approval Threshold Logic

This is implemented in application code, not database triggers.

```typescript
// lib/utils/approvals.ts

const THRESHOLD_FINANCE = Number(process.env.NEXT_PUBLIC_APPROVAL_THRESHOLD_FINANCE) || 50000
const THRESHOLD_MD      = Number(process.env.NEXT_PUBLIC_APPROVAL_THRESHOLD_MD)      || 100000

export function getRequiredApprovals(amount: number): approval_level[] {
  if (amount < THRESHOLD_FINANCE) return []              // auto-approved
  if (amount < THRESHOLD_MD)      return ['finance']     // finance only
  return ['finance', 'md']                               // both required
}
```

---

## 4. Storage Bucket Config

Create these buckets in Supabase Dashboard → Storage:

| Bucket name  | Public | Max file size | Allowed MIME types       |
| ------------ | ------ | ------------- | ------------------------ |
| `bills`      | No     | 10 MB         | image/*, application/pdf |
| `contracts`  | No     | 10 MB         | image/*, application/pdf |
| `references` | No     | 10 MB         | image/*, application/pdf |

All buckets are private. Access via signed URLs with 1-hour expiry.

---

## 5. Seed Data

Run after schema creation to set up the 7 user accounts:

```sql
-- After creating auth users via Supabase dashboard or auth API,
-- insert their profiles:

INSERT INTO user_profiles (id, name, role, phone) VALUES
  ('uuid-of-maliha',   'Maliha',   'managing_director', '+880...'),
  ('uuid-of-avraw',    'Avraw',    'finance_manager',   '+880...'),
  ('uuid-of-shajed',   'Shajed',   'client_comms',      '+880...'),
  ('uuid-of-sumit',    'Sumit',    'vendor_manager',    '+880...'),
  ('uuid-of-prottoy',  'Prottoy',  'operations',        '+880...'),
  ('uuid-of-shaswata', 'Shaswata', 'decoration',        '+880...'),
  ('uuid-of-tanjim',   'Tanjim',   'design',            '+880...');
```
