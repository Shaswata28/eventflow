# Application Flow Document
## EventFlow — Internal Event Management System
**Version:** 1.0  
**Date:** June 2026  

---

## 1. Authentication Flow

```
User visits any URL
        │
        ▼
Middleware checks session
        │
   ┌────┴────┐
   │         │
No session  Session valid
   │         │
   ▼         ▼
/login    /dashboard (role-aware)
   │
   ▼
Enter email + password
   │
   ▼
Supabase Auth validates
   │
   ├── Fail → Show error, stay on /login
   │
   └── Success → Fetch user_profile (name, role)
                │
                ▼
            Store in Zustand (authStore)
                │
                ▼
            Redirect → /dashboard
```

---

## 2. Dashboard Flow (Role-Aware Landing)

```
/dashboard
     │
     ▼
Read role from authStore
     │
     ├── MD              → Pending approvals + all programs + active clients
     ├── Finance Manager → Pending approvals + budget summary per program
     ├── Client Comms    → Active clients + quotations pending + leads
     ├── Vendor Manager  → Assignments pending + advances due
     ├── Operations/HR   → Today's checklist (if live event) + upcoming programs
     ├── Decoration      → Decoration assignments this week
     └── Design          → Active programs assigned to them
```

---

## 3. Full Client Lifecycle Flow

### Step 1 — Lead Intake

```
Shajed (Client Comms) clicks "New Client"
        │
        ▼
Fill client form:
  - Family name, bride, groom
  - Contact details
  - Event type
  - Budget range
  - Initial consultation notes (rich text)
        │
        ▼
Save → client created with status: "Consultation"
Auto-generated Client ID (CL-XXX)
        │
        ▼
Client appears in Shajed's client list
MD can also see all clients
```

### Step 2 — Consultation Notes

```
Client profile → Consultation Notes tab
        │
        ▼
Tiptap rich-text editor opens
        │
        ▼
Shajed types meeting notes:
  - Requirements discussed
  - Programs requested
  - Budget discussed
  - Follow-up items
        │
        ▼
Save → note stored with timestamp + author
Multiple notes can be added over time (log-style)
```

### Step 3 — Create Event Programs

```
Client profile → Programs tab → "Add Program"
        │
        ▼
Fill program form:
  - Program name (Holud / Mehendi / Reception / Custom)
  - Date (date picker)
  - Venue
  - Guest count
  - Theme notes
  - Responsible partner
        │
        ▼
Save → program created, status: "Planning"
        │
        ▼
Program appears on Calendar (blocked date)
System checks: date conflict? → warn if another program exists on same date
```

### Step 4 — Build Quotation

```
Program detail → Quotation tab → "Create Quotation"
        │
        ▼
Add line items:
  - Service category
  - Estimated cost
  (repeat for each service across all programs)
        │
        ▼
System calculates:
  - Per-program subtotal
  - Grand total
  - Advance amount
        │
        ▼
Status: "Draft"
        │
        ▼
Shajed reviews → changes status to "Internal Review"
        │
        ▼
MD or Finance Manager reviews
        │
   ┌────┴────┐
   │         │
Reject    Approve
(note)       │
   │         ▼
   │    Status: "Sent to Client"
   │         │
   │    Client reviews (offline / in person)
   │         │
   │    Shajed updates status:
   │    ├── "Approved" → proceed to budget allocation
   │    └── "Rejected" → revise or archive
   │
   └── Revise → new version, back to Draft
```

### Step 5 — Budget Allocation

```
Quotation approved by client
        │
        ▼
Shajed or MD clicks "Allocate Budgets"
        │
        ▼
System creates service_category rows:
  For each program × service:
  - Category name
  - Allocated budget (from quotation line items)
  - Assigned partner
        │
        ▼
Notifications sent:
  - Sumit (Vendor Manager) → for all vendor categories
  - Shaswata (Decoration) → for decoration categories
        │
        ▼
Program status → "Vendors Sourcing"
```

### Step 6 — Vendor Sourcing

```
Sumit opens notification → sees service category
        │
        ▼
Opens Vendor Database
  Filter by: category, budget range, rating
        │
        ▼
Compares vendor options (price history visible)
        │
        ▼
Selects vendor → fills Vendor Assignment form:
  - Linked vendor (from DB or new entry)
  - Quoted price
  - Notes
        │
        ▼
Save → Vendor Assignment created
Status: "Pending Approval"
        │
        ▼
Does quoted price require approval?
  │
  ├── < ৳50,000  → Auto-approved → status: "Approved"
  │
  ├── ৳50,000–1,00,000 → Finance Manager approval required
  │    Avraw gets notification
  │
  └── > ৳1,00,000 → Finance Manager → then MD approval required
       Both get notifications
```

### Step 7 — Approval Flow

```
Avraw (Finance Manager) opens Approvals page
        │
        ▼
Sees pending approval:
  Vendor name | Category | Amount | Program | Requested by
        │
        ▼
Reviews → clicks "Approve" or "Reject"
  Must enter a note on either action
        │
        ▼
  ┌──────┴──────┐
  │             │
Reject       Approve
  │             │
  ▼             ▼
Sumit gets    Amount > ৳1,00,000?
notification    │
with reason   ┌─┴─┐
              │   │
             No  Yes
              │   │
              ▼   ▼
           Done  MD approval needed
                  Maliha gets notification
                        │
                   ┌────┴────┐
                   │         │
                Reject    Approve
                   │         │
                   ▼         ▼
               Sumit gets  Status: "Approved"
               notification Sumit gets notification
```

### Step 8 — Vendor Confirmation

```
Vendor assignment status: "Approved"
        │
        ▼
Sumit contacts vendor (outside system)
        │
        ▼
Returns to system → opens vendor assignment
        │
        ▼
Fills in:
  - Advance paid amount
  - Uploads bill / receipt (PDF or image)
  - Any additional notes
        │
        ▼
Clicks "Mark as Confirmed"
Status → "Confirmed"
        │
        ▼
Avraw gets notification: "Advance paid for [vendor] — [amount]"
Activity log updated
```

### Step 9 — Pre-Event State

```
All vendors for a program confirmed
        │
        ▼
Program status → "Ready"
        │
        ▼
Prottoy (Ops) builds event-day checklist:
  - Import template or create from scratch
  - Assign tasks to partners
  - Set priorities and due times
        │
        ▼
All partners can view their assigned tasks
```

### Step 10 — Event Day (Live)

```
Event date arrives
Program status → "Live"
        │
        ▼
Prottoy opens checklist on mobile
        │
        ▼
Each partner sees their department tasks
        │
        ▼
Tick task → instantly updates for all connected devices
        │
(If issue occurs)
        ▼
Partner flags task with note
        │
        ▼
Prottoy or MD sees flag in real time
If extra spend needed → MD logs emergency approval note
        │
        ▼
All tasks complete → Prottoy marks checklist "Done"
Program status → "Completed"
```

---

## 4. Vendor Database Flow

```
Sumit opens /vendors
        │
        ▼
Search / filter:
  - By category
  - By price range
  - By rating
  - By area
        │
        ▼
Results list (card view)
        │
   ┌────┴────┐
   │         │
View      Add New Vendor
detail         │
   │           ▼
   ▼       Fill form:
Edit/      - Name, category, contact
Update     - Location
           - Last known price
           - Notes
                │
                ▼
           Save → vendor in DB
           Available for all future assignments
```

---

## 5. Navigation Structure

```
Sidebar (desktop/tablet)           Bottom Nav (mobile)
─────────────────────             ─────────────────────
🏠 Dashboard                      🏠 Home
👤 Clients                        👤 Clients  
📅 Calendar                       📅 Calendar
🏪 Vendors                        🏪 Vendors
✅ Approvals  [badge: count]       ☰  More
⬛ Settings
```

---

## 6. Notification Flow

```
System event occurs
(vendor assigned / approved / checklist flagged)
        │
        ▼
Insert row into activity_log table
        │
        ▼
Supabase Realtime broadcasts to connected clients
        │
        ▼
Relevant user's session receives update
        │
        ▼
Notification badge updates (approvals count)
Activity feed shows new entry
```

---

## 7. Page-Level Access Control

| Route | Who can access |
|---|---|
| `/dashboard` | All authenticated users |
| `/clients` | MD, Client Comms |
| `/clients/[id]` | MD, Client Comms |
| `/clients/[id]/programs/[id]` | All (read), MD + Client Comms (edit) |
| `/calendar` | All |
| `/vendors` | MD, Vendor Manager, Decoration |
| `/vendors/[id]` | MD, Vendor Manager, Decoration |
| `/approvals` | MD, Finance Manager |
| `/settings` | MD only |

Non-permitted routes show a "You don't have access" screen with a back button — never a 404 or error.
