# Implementation Plan
## EventFlow — Internal Event Management System
**Version:** 1.0  
**Date:** June 2026  
**Developer:** Solo (CS Student)  
**Estimated Timeline:** 10–14 weeks  

---

## 1. Overview

This plan breaks the build into 6 phases. Each phase produces working, usable software — not just scaffolding. Complete and test each phase before starting the next. The goal is to have a usable system by Phase 3 and a complete MVP by Phase 6.

| Phase | Focus | Estimated Duration |
|---|---|---|
| 0 | Setup and scaffolding | 3–4 days |
| 1 | Auth + shell + dashboard | 1 week |
| 2 | Client CRM + consultation notes | 1.5 weeks |
| 3 | Event programs + calendar | 1.5 weeks |
| 4 | Vendor database + assignments | 2 weeks |
| 5 | Approval workflow + documents | 1.5 weeks |
| 6 | Event-day checklist + polish | 1.5 weeks |

---

## 2. Phase 0 — Project Setup (Days 1–4)

### Goal
Working development environment. Skeleton app runs. Supabase project connected.

### Tasks

**2.1 Initialize Next.js project**
```bash
npx create-next-app@latest eventflow \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir false \
  --import-alias "@/*"

cd eventflow
```

**2.2 Install core dependencies**
```bash
# UI
npx shadcn@latest init
npx shadcn@latest add button input label select textarea dialog sheet badge skeleton toast card table form

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# State + data
npm install zustand @tanstack/react-query

# Forms + validation
npm install react-hook-form zod @hookform/resolvers

# Calendar
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# Rich text
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder

# Dates
npm install date-fns

# PWA
npm install next-pwa
```

**2.3 Create Supabase project**
- Go to supabase.com → New project
- Choose Singapore region
- Save the project URL and anon key
- Create `.env.local` with credentials

**2.4 Run database schema**
- Open Supabase Dashboard → SQL Editor
- Paste and run the full schema from `05_BACKEND_SCHEMA.md`
- Verify all tables created: check Table Editor

**2.5 Create storage buckets**
- Supabase Dashboard → Storage → New bucket
- Create: `bills`, `contracts`, `references`
- All set to private

**2.6 Set up folder structure**
Create the folder structure as defined in `02_TRD.md` section 2.

**2.7 Configure PWA**
```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // Next.js config
})
```

**2.8 Auto-generate TypeScript types**
```bash
npx supabase login
npx supabase gen types typescript \
  --project-id YOUR_PROJECT_ID \
  > types/database.types.ts
```

**Done when:** `npm run dev` shows the Next.js welcome page. Supabase client connects without errors.

---

## 3. Phase 1 — Auth + Shell + Dashboard (Week 1)

### Goal
All 7 users can log in. Role-based sidebar renders. Dashboard shows placeholder metric cards.

### Tasks

**3.1 Supabase auth setup**
- Create 7 user accounts in Supabase Dashboard → Authentication → Users
- Insert corresponding rows into `user_profiles` table (seed SQL from schema doc)

**3.2 Build login page** (`app/(auth)/login/page.tsx`)
- Email + password form using React Hook Form + Zod
- Call `supabase.auth.signInWithPassword()`
- On success → redirect to `/dashboard`
- Show error message on failure
- Simple centered card layout, EventFlow logo at top

**3.3 Build auth middleware** (`middleware.ts`)
```typescript
// Protect all /dashboard/* routes
// Redirect unauthenticated users to /login
// Use createServerClient from @supabase/ssr
```

**3.4 Build Supabase clients**
- `lib/supabase/client.ts` — browser client (for Client Components)
- `lib/supabase/server.ts` — server client (for Server Components and Server Actions)

**3.5 Build auth store** (`lib/stores/authStore.ts`)
```typescript
// Zustand store
// State: user, role, profile
// Actions: setUser, setProfile, clearAuth
// Populated on login, cleared on logout
```

**3.6 Build app shell** (`app/(dashboard)/layout.tsx`)
- Sidebar component (desktop/tablet)
- Mobile bottom navigation
- Top bar (mobile only — shows logo + hamburger)
- Logout button calls `supabase.auth.signOut()`

**3.7 Build sidebar** (`components/layout/Sidebar.tsx`)
- Navigation links: Dashboard, Clients, Calendar, Vendors, Approvals, Settings
- Show only permitted links based on role (use `can()` helper)
- Active link highlight
- User avatar, name, role at bottom

**3.8 Build dashboard page** (`app/(dashboard)/page.tsx`)
- Role-aware greeting: "Good morning, Shajed"
- Metric cards (hardcoded placeholder data for now)
- Upcoming events section (empty state with "No upcoming events")
- Activity feed (empty state)

**3.9 Set up React Query**
```typescript
// app/(dashboard)/layout.tsx or root layout
// Wrap children with QueryClientProvider
```

**Done when:** All 7 users can log in with their own email. Each sees their name and role. Sidebar shows role-appropriate links. Navigating to protected routes without login redirects to `/login`.

---

## 4. Phase 2 — Client CRM + Consultation Notes (Weeks 2–3)

### Goal
Shajed can create clients, write consultation notes. All partners can view the client list.

### Tasks

**4.1 Client list page** (`app/(dashboard)/clients/page.tsx`)
- Fetch clients from Supabase with React Query
- Render as a table: Client Code, Name, Event Type, Status, Assigned To, Created At
- Search bar (filters client name client-side for MVP)
- Status filter dropdown
- Empty state: "No clients yet — Add first client"
- "New Client" button (visible only to MD and Client Comms)

**4.2 New client form** (`app/(dashboard)/clients/new/page.tsx`)
- Shadcn Sheet (drawer) or full page form
- Fields: Full name, Bride name, Groom name, Phone primary, Phone secondary, Email, Event type, Budget range
- React Hook Form + Zod validation
- On submit: `supabase.from('clients').insert(...)`
- On success: navigate to new client's detail page
- Role guard: redirect non-permitted roles away

**4.3 Client detail page** (`app/(dashboard)/clients/[id]/page.tsx`)
- Fetch client by ID
- Show all fields in a clean layout
- Tabs: Overview | Notes | Programs | Documents
- Edit button (MD and Client Comms only) → opens edit form in Sheet

**4.4 Consultation notes tab**
- List of notes in chronological order (newest first)
- Each note shows: author name, timestamp, content (rendered from Tiptap JSON)
- "Add Note" button opens the Tiptap editor in a Sheet
- Tiptap editor: starter-kit + placeholder extension
- Auto-save every 30 seconds during editing
- On save: insert into `consultation_notes` table + insert into `activity_log`

**4.5 Tiptap editor component** (`components/clients/ConsultationEditor.tsx`)
```typescript
// Toolbar: Bold, Italic, Bullet list, Numbered list, Heading 2
// Placeholder: "Write consultation notes here..."
// onUpdate → debounced save to state
// onSave → persist to database
// Shows "Saving..." / "Saved ✓" indicator
```

**4.6 useClients hook** (`lib/hooks/useClients.ts`)
```typescript
// useClients() → list of clients
// useClient(id) → single client with notes + programs
// useMutateClient() → insert / update
```

**Done when:** Shajed can create a client, write detailed notes, and view them later. All partners can see the client list. Edit is restricted by role.

---

## 5. Phase 3 — Event Programs + Calendar (Weeks 3–4)

### Goal
Programs can be created per client. Calendar shows all programs. Date conflicts are warned.

### Tasks

**5.1 Programs tab on client detail**
- List of programs for this client: name, date, venue, status, responsible partner
- "Add Program" button (MD and Client Comms)
- Each program row → click to open program detail

**5.2 New program form**
- Fields: Program name (dropdown + custom), Date, Venue name, Venue address, Guest count, Theme notes, Responsible partner
- On date select: check for existing programs on same date
  ```typescript
  const { data } = await supabase
    .from('event_programs')
    .select('id, client_id, program_name')
    .eq('event_date', selectedDate)
  if (data?.length > 0) showConflictWarning(data)
  ```
- On submit: insert program + update client status to 'confirmed' if was 'consultation'

**5.3 Program detail page** (`app/(dashboard)/clients/[id]/programs/[programId]/page.tsx`)
- Show program overview: date, venue, guest count, theme, status
- Tabs: Overview | Budget & Vendors | Checklist | Documents
- Breadcrumb: Clients → Ahmed Family → Reception
- Edit program button

**5.4 Calendar page** (`app/(dashboard)/calendar/page.tsx`)
- FullCalendar component with month and week views
- Fetch all programs with client names
- Render each program as an event block (program name + client name)
- Color by status (see UI/UX Brief section 7)
- Click event → navigate to program detail page
- View toggle: Month / Week

**5.5 EventCalendar component** (`components/calendar/EventCalendar.tsx`)
```typescript
// Wraps FullCalendar
// Props: events (from React Query)
// Custom eventContent renderer → shows client name + program name
// Toolbar: prev/next/today + month/week toggle
// Responsive: on mobile, default to week view
```

**Done when:** Programs visible on calendar. Clicking a date with an existing program warns. All programs for all clients show correctly color-coded.

---

## 6. Phase 4 — Vendor Database + Assignments (Weeks 5–6)

### Goal
Sumit can search the vendor database and assign vendors to service categories with budget tracking.

### Tasks

**6.1 Budget allocation on program detail**
- On "Budget & Vendors" tab: show service categories
- If no categories yet: "Allocate Budget" button → opens form
- Form: for each service needed, enter allocated budget + assign partner
- On save: insert `service_categories` rows + send notification entries to `activity_log`

**6.2 Vendor list page** (`app/(dashboard)/vendors/page.tsx`)
- Filter bar: Category, Min/Max price, Rating, Area, Active/Inactive
- Card grid or table view toggle
- Each vendor card: name, category, last price, rating, area
- "Add Vendor" button (Vendor Manager, Decoration, MD)
- Search by name (client-side filter)

**6.3 Add vendor form**
- Fields: Name, Category, Phone primary, Phone secondary, Location, Area, Last known price, Rating, Notes
- Validation: name + category + phone are required
- On submit: insert into `vendors`

**6.4 Vendor detail page** (`app/(dashboard)/vendors/[id]/page.tsx`)
- Show all vendor fields
- History: which programs this vendor was used for (query `vendor_assignments` by vendor_id)
- Edit button

**6.5 Vendor assignment on program**
- In "Budget & Vendors" tab, each service category row has: "Find Vendor" button
- Opens a Sheet with:
  - Search/filter vendors by category (pre-filtered)
  - List of matching vendors with last price and rating
  - "Select" button on each
  - Or: "Add new vendor" option
- After selecting: fill quoted price, notes
- On save: insert `vendor_assignment` row
- Check threshold → insert `approval_requests` if needed → notify approver via `activity_log`

**6.6 useVendors hook** (`lib/hooks/useVendors.ts`)
```typescript
// useVendors(filters?) → filtered vendor list
// useVendorAssignments(serviceCategoryId) → assignments for a category
// useMutateVendorAssignment() → create/update assignment
```

**Done when:** Full vendor sourcing flow works. Sumit can search, compare, and assign vendors. Budget vs quoted price is visible. Approval requests are created automatically.

---

## 7. Phase 5 — Approval Workflow + Document Upload (Weeks 7–8)

### Goal
Avraw and Maliha can review, approve, or reject vendor assignments with notes. Bills can be uploaded.

### Tasks

**7.1 Approvals page** (`app/(dashboard)/approvals/page.tsx`)
- Role guard: only Finance Manager and MD can access
- Two tabs: Pending | Resolved
- Each pending approval shows:
  - Vendor name and category
  - Program name and client name
  - Quoted amount
  - Requested by + date
  - "Approve" and "Reject" buttons
- On "Reject": modal asks for mandatory note before confirming
- On "Approve": updates approval_request status + resolves or escalates

**7.2 Approval logic service** (`lib/utils/approvals.ts`)
```typescript
async function resolveApproval(
  approvalId: string,
  decision: 'approved' | 'rejected',
  note: string,
  currentUserRole: UserRole
): Promise<void> {
  // 1. Update approval_request: status, note, resolved_at
  // 2. If rejected: update vendor_assignment status to 'rejected'
  //    Log to activity_log + notify requestor
  // 3. If approved at 'finance' level AND amount > MD_THRESHOLD:
  //    Create new approval_request for 'md' level
  //    Notify MD
  // 4. If approved at 'md' level OR (approved at 'finance' + amount <= MD_THRESHOLD):
  //    Update vendor_assignment status to 'approved'
  //    Notify vendor manager
  // 5. Log to activity_log
}
```

**7.3 Approval badge on sidebar**
- Query pending approval count for current user's role
- Show badge on Approvals nav item
- Refresh via React Query with 30-second polling

**7.4 Document upload component** (`components/shared/DocumentUpload.tsx`)
```typescript
// Props: parentType ('vendor_assignment' | 'program' | 'client')
//        parentId: UUID
//        allowedLabels: document_label[]
// UI: drag-and-drop zone + file picker
// Validates: type (PDF/image) and size (< 10MB) before upload
// Upload flow:
//   1. Upload to Supabase Storage
//   2. Insert row into documents table
//   3. Show upload progress
//   4. On complete: show file in list below uploader
```

**7.5 Document list component**
- Shows uploaded files for a vendor assignment or program
- Each file: icon (PDF/image), label, filename, uploaded by, date
- Download button → generates signed URL → opens in new tab

**7.6 Mark vendor as confirmed**
- After approval, Vendor Manager sees "Mark as Confirmed" button on vendor assignment
- Opens a form: Advance paid amount + Upload bill (optional)
- On save: updates `vendor_assignment` status to 'confirmed' + logs to activity_log

**Done when:** Full approval chain works end to end. Avraw can approve/reject. MD receives second-tier requests. Bills can be uploaded and viewed.

---

## 8. Phase 6 — Event-Day Checklist + Polish (Weeks 9–10)

### Goal
Prottoy can build a checklist for any program. On event day, the team ticks tasks in real time from mobile.

### Tasks

**8.1 Checklist tab on program detail**
- Shows tasks grouped by department
- Progress bar: X / Y tasks complete
- "Add Task" button → inline form (title, department, priority, assign to, due time)
- "Use Template" button → loads a predefined default checklist
- Empty state: "No tasks yet — build your checklist"

**8.2 Task row component** (`components/checklist/TaskRow.tsx`)
```typescript
// Checkbox (large touch target for mobile)
// Task title (strikethrough when done)
// Priority badge (high = red, normal = blue, low = gray)
// Assigned to avatar + name
// Due time (if set)
// "Done by [name] at [time]" when completed
// Flag button → opens note input
// Optimistic update on tick (update UI before server confirms)
```

**8.3 Real-time sync**
```typescript
// components/checklist/ChecklistBoard.tsx
// Subscribe to Supabase Realtime on event_checklists table
// Filter by program_id
// On change: invalidate React Query cache → re-render affected tasks
// Works across all connected devices simultaneously
```

**8.4 Checklist templates**
```typescript
// lib/utils/checklistTemplates.ts
// Default templates per program type:
// Wedding Reception: Stage, Entrance, Dining, Catering, Photography, Sound, Generator, ...
// Holud: Decoration, Catering, Photography, ...
// Button "Use Template" pre-populates the checklist
```

**8.5 Activity feed (real-time)**
- Dashboard activity feed subscribes to `activity_log` via Supabase Realtime
- New entries appear at top without page refresh
- Shows: actor name, action, entity name, timestamp (relative: "2 min ago")
- Limit to last 20 entries

**8.6 Dashboard metric cards (live data)**
- Wire up all metric cards with real Supabase queries
- MD: Pending approvals, Active clients, Events this week, Vendors confirmed
- Finance Manager: Pending approvals, Total advance paid this month
- Client Comms: Active clients, Quotations pending client approval
- Each metric auto-refreshes every 60 seconds

**8.7 Global search** (Cmd/Ctrl + K)
- Command palette using Shadcn `<CommandDialog>`
- Searches: clients by name, vendors by name, programs by date/venue
- Navigate directly to result on select

**8.8 PWA final config**
- Test "Add to Home Screen" on iOS Safari and Android Chrome
- Verify offline: open checklist page, disable network, confirm it still loads
- Check all PWA icons are correct

**8.9 Responsive QA**
- Test every page on: 375px (mobile), 768px (tablet), 1280px (desktop)
- Fix any layout breaks
- Verify bottom nav works on mobile
- Verify sidebar collapses correctly on tablet

**8.10 Final testing checklist**
- [ ] All 7 users can log in
- [ ] Role restrictions prevent unauthorized access (test each role)
- [ ] Client creation + notes flow works
- [ ] Program creation warns on date conflict
- [ ] Calendar shows all programs, clicking navigates correctly
- [ ] Vendor assignment triggers correct approval chain
- [ ] Approval resolves and notifies correctly
- [ ] Bill upload and download work
- [ ] Checklist ticks sync across two browser windows simultaneously
- [ ] PWA installs and checklist works offline

**Done when:** All test items above pass. System is ready for real use.

---

## 9. Deployment

**9.1 GitHub repository**
- Create private GitHub repository
- Push code
- Never commit `.env.local`

**9.2 Vercel deployment**
- Connect GitHub repo to Vercel
- Add environment variables in Vercel dashboard (same as `.env.local`)
- Deploy → Vercel auto-generates HTTPS URL
- Share URL with all 7 partners

**9.3 Custom domain (optional)**
- Buy a domain (e.g. eventflow.yourfirmname.com)
- Add to Vercel → DNS records configured automatically

**9.4 Supabase production checklist**
- Confirm RLS is enabled on all tables (verify in Supabase Dashboard)
- Confirm storage buckets are private
- Enable database backups (Supabase Dashboard → Settings → Backups)

---

## 10. Post-MVP Backlog (Do Not Build Yet)

Keep these out of scope for Phase 1. Revisit after the system has been used for at least 3 real events:

- Client-facing quotation PDF export
- Email notifications (Supabase + Resend)
- SMS alerts for event-day emergencies
- Profit/loss financial reporting
- Multi-language support (Bengali + English)
- Vendor rating submission after event completion
- Recurring checklist templates (save custom templates per program type)
- Partner performance dashboard (tasks completed, approvals processed)

---

## 11. Development Tips

**Work in vertical slices, not horizontal layers.** Don't build all database hooks first, then all UI. Build one complete feature (e.g. Client CRM) end to end before moving to the next.

**Commit after every completed task.** Small commits make debugging easier. Name commits clearly: `feat: add client creation form`, `fix: checklist real-time sync`.

**Use Supabase Studio as your admin panel.** During development, the Supabase Table Editor is your best friend for inspecting data, testing queries, and manually fixing bad data.

**Test RLS early.** Log in as different users and verify they can only see and do what their role permits. RLS bugs are hard to find late in development.

**Don't optimize early.** Get it working first. Pagination, caching optimizations, and performance tuning come after the system is functionally complete.
