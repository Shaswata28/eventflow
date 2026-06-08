# Product Requirements Document (PRD)
## EventFlow — Internal Event Management System
**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft — Ready for Development  

---

## 1. Overview

### 1.1 Product Summary

EventFlow is an internal Progressive Web App (PWA) built for a Bangladeshi event planning firm. It replaces scattered WhatsApp threads, spreadsheets, and verbal workflows with a single, role-aware system that manages the full lifecycle of an event — from the first client consultation through vendor confirmation, approvals, and live event-day execution.

### 1.2 The Problem

The firm currently has no centralized system. Client details live in notebooks. Vendor contacts are stored in personal phones. Budget approvals happen verbally or over WhatsApp. There is no audit trail, no way to prevent double-booking, and no single source of truth that all 7 partners can reference. As the firm grows, this breaks down.

### 1.3 The Solution

A role-based internal management system with six core modules:

1. Client CRM with rich-text consultation notes
2. Event programs and calendar
3. Vendor database and vendor assignment per program
4. Approval workflow with Finance Manager and MD gates
5. Document storage (bills, contracts, quotations)
6. Event-day live checklist

---

## 2. Users and Roles

The system has 7 named users mapped to the firm's 7 partners.

| Role | Partner | Primary Responsibilities in System |
|---|---|---|
| Managing Director (MD) | Maliha | Final approvals, full system access, MD dashboard |
| Finance Manager | Avraw | Budget oversight, approval gate (level 1), financial records |
| Client Communication | Shajed | Client CRM, consultation notes, quotation creation |
| Vendor Manager | Sumit | Vendor database, vendor assignments, advance payments |
| Operations / HR | Prottoy | Event-day checklists, team assignments, logistics |
| Event Production / Decoration | Shaswata | Decoration vendor assignments, decoration checklist |
| Design Manager | Farhan | Creative briefs, design assets, reference uploads |

### 2.1 Role Permissions Matrix

| Feature | MD | Finance | Client Comms | Vendor Mgr | Ops/HR | Decoration | Design |
|---|---|---|---|---|---|---|---|
| Create client | ✓ | — | ✓ | — | — | — | — |
| Edit client | ✓ | — | ✓ | — | — | — | — |
| Create event program | ✓ | — | ✓ | — | — | — | — |
| Create quotation | ✓ | ✓ | ✓ | — | — | — | — |
| Allocate budget | ✓ | ✓ | — | — | — | — | — |
| Add vendor to DB | ✓ | — | — | ✓ | — | ✓ | — |
| Assign vendor to program | ✓ | — | — | ✓ | — | ✓ | — |
| Approve vendor (Finance) | — | ✓ | — | — | — | — | — |
| Approve vendor (MD) | ✓ | — | — | — | — | — | — |
| Upload bills/documents | ✓ | ✓ | — | ✓ | — | ✓ | — |
| Manage checklists | ✓ | — | — | — | ✓ | ✓ | — |
| View all data | ✓ | ✓ | — | — | — | — | — |

---

## 3. Core Modules

### 3.1 Client CRM

**Purpose:** Central record for every client the firm works with.

**Must-have fields:**
- Auto-generated Client ID (e.g. CL-031)
- Full name (family / organization name)
- Bride name, Groom name (for wedding events)
- Primary phone and secondary phone
- Email address
- Event type (Wedding, Corporate, Birthday, Other)
- Budget range
- Client status (Lead → Consultation → Confirmed → Completed → Archived)
- Assigned partner (who manages this client)
- Created by, created at

**Consultation notes:**
- Rich-text notebook per client (Tiptap editor)
- Supports headings, bullet points, bold, links
- Multiple notes can be added over time (timestamped)
- Only the assigned Client Comms partner and MD can write notes; all can read

---

### 3.2 Event Programs

**Purpose:** One client can have multiple programs (Holud, Mehendi, Reception, etc.). Each program is a separate operational unit with its own date, venue, budget, and vendor set.

**Must-have fields:**
- Program name (freeform text or dropdown: Holud, Mehendi, Reception, Engagement, Corporate, Birthday, Custom)
- Event date
- Venue name and address
- Guest count (estimated)
- Theme / color notes
- Responsible partner
- Program status (Planning → Vendors Sourcing → Vendors Confirmed → Ready → Live → Completed)

**Program is the central unit.** All service categories, vendor assignments, checklists, and documents attach to a program — not directly to the client.

---

### 3.3 Calendar

**Purpose:** Visual display of all programs across all clients. Prevents double-booking. Shows workload by week or month.

**Requirements:**
- Month, week, and day views
- Each program shows as an event block: program name + client name
- Color-coded by program status
- Click event block → opens program detail
- Filter by: responsible partner, status, date range
- Read-only for non-admin roles (no drag-to-reschedule in MVP)

---

### 3.4 Quotation

**Purpose:** Formal cost estimate given to the client before confirmation. Built per program or as a combined multi-program quote.

**Must-have fields:**
- Line items per service category (Decor, Catering, Photography, Sound/Light, etc.)
- Subtotals per program
- Grand total
- Advance amount (percentage or fixed)
- Quote status (Draft → Internal Review → Sent to Client → Approved → Rejected)
- Version number (if revised)

**No billing or accounting in MVP.** Quotation is a planning document only.

---

### 3.5 Budget Allocation

**Purpose:** After client confirms, the agreed amounts per service category become the working budget for the vendor team.

**Behavior:**
- Created automatically from the approved quotation, or manually entered
- One row per service category per program
- Each row has: category name, allocated amount, assigned partner, status
- When allocated, the assigned partner receives a system notification

---

### 3.6 Vendor Database

**Purpose:** Reusable, searchable directory of all vendors the firm has ever worked with or considered.

**Must-have fields:**
- Vendor name
- Category (Decor, Catering, Photography, Sound/Light, Flowers, Printing, Transport, Other)
- Phone number(s)
- Location / area
- Last used price
- Rating (1–5, set by team after each event)
- Notes (freeform)
- Active / inactive status

**Search and filter:** by category, by price range, by rating, by area.

---

### 3.7 Vendor Assignment

**Purpose:** Links a specific vendor to a specific service category within a specific program.

**Must-have fields:**
- Linked program + service category
- Linked vendor (from database) or new vendor entry
- Quoted price
- Advance paid amount
- Remaining balance
- Assignment status (Pending Approval → Approved → Confirmed → Paid → Completed)
- Requested by, approved by, timestamps

**Triggers approval workflow** if quoted price exceeds a defined threshold (set in system settings).

---

### 3.8 Approval Workflow

**Purpose:** Ensures financial accountability for vendor expenses. Mirrors the firm's deed requirements.

**Two-tier approval:**
- **Tier 1 — Finance Manager (Avraw):** Required for all vendor assignments above ৳X (configurable threshold, default ৳50,000)
- **Tier 2 — Managing Director (Maliha):** Required for all vendor assignments above ৳Y (configurable threshold, default ৳1,00,000)

**Approval record fields:**
- Approval level (Finance / MD)
- Status (Pending / Approved / Rejected)
- Note from approver
- Timestamp

**Behavior:**
- Approver receives in-app notification
- Approver can approve or reject with a mandatory note
- If rejected, Vendor Manager is notified with the reason
- Full approval chain is visible in the vendor assignment detail

---

### 3.9 Document Storage

**Purpose:** Attach files to vendor assignments or programs.

**Supported formats:** PDF, JPG, PNG, WEBP  
**Max file size:** 10MB per file  
**Labels:** Bill / Receipt, Contract, Quotation, Agreement, Reference Image, Other

**Linked to:**
- Vendor assignment (vendor bills, receipts)
- Program (client agreement, venue contract)
- Client (general documents)

---

### 3.10 Event-Day Checklist

**Purpose:** Live operational sheet used on the day of an event. Replaces physical checklists and WhatsApp coordination.

**Structure:**
- One checklist per program
- Tasks grouped by department (Decoration, Catering, Logistics, Photography, Sound/Light, General)
- Each task has: title, assigned person, priority (High/Normal/Low), due time, done status, done-at timestamp
- Tasks can be pre-built (template) or added on the fly

**Behavior:**
- Any team member can tick off tasks assigned to them
- Completed tasks show strikethrough with timestamp and name of who ticked it
- Progress bar shows % complete per department
- Flagging: any task can be flagged with a note (e.g. "delayed — caterer late")

---

### 3.11 Dashboard

**Purpose:** Landing page after login. Role-aware — shows each partner what is most relevant to them.

**Common elements (all roles):**
- Upcoming events this week (program cards)
- Recent activity feed

**Role-specific widgets:**
- MD: Pending approvals count, all programs overview, total active clients
- Finance Manager: Pending approvals, budget summary per active program
- Client Comms: Active clients, quotations pending, leads in consultation
- Vendor Manager: Vendor assignments pending confirmation, advance payments due
- Ops/HR: Today's checklist if event is live, upcoming program assignments
- Decoration: Decoration assignments this week

---

## 4. Out of Scope (MVP)

The following are explicitly excluded from Phase 1:

- Billing, invoicing, and accounting
- Profit/loss reporting
- Payroll or partner profit-sharing calculations
- Client-facing portal (clients do not log into this system)
- SMS or email notifications to clients
- Mobile native app (iOS/Android) — PWA only
- Integration with Google Calendar or any external calendar
- Multi-language support

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Responsive design | Works on laptop (1280px+), tablet (768px+), mobile (375px+) |
| Load time | Dashboard loads within 2 seconds on standard broadband |
| Offline support | Event-day checklist accessible offline (PWA cache) |
| File upload | Max 10MB per file, PDF and image formats |
| Concurrent users | Supports all 7 partners simultaneously |
| Data privacy | All data stored in Supabase (EU or Singapore region), no third-party analytics |
| Browser support | Chrome, Firefox, Safari, Edge — latest 2 versions |

---

## 6. Success Criteria

The system is considered successful when:

1. All 7 partners can log in and complete their role's tasks without confusion
2. A full event cycle (client → programs → vendors → approvals → event day) can be completed without WhatsApp or paper
3. Zero double-bookings occur due to the calendar
4. All vendor approvals are logged with name, note, and timestamp
5. Event-day checklists are used live on mobile during at least 3 consecutive events
