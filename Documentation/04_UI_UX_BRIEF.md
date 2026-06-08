# UI/UX Brief
## EventFlow — Internal Event Management System
**Version:** 1.0  
**Date:** June 2026  

---

## 1. Design Philosophy

EventFlow is a professional internal tool, not a consumer product. The interface should feel calm, organized, and trustworthy — not flashy. Every screen has a clear job to do. Visual noise is the enemy.

**Three design principles:**

**Clarity first.** Every piece of information should be immediately scannable. Partners opening the app on event day should find what they need in under 3 seconds.

**Role-aware simplicity.** A user should only see what is relevant to their role. Avoid overwhelming anyone with data that isn't their responsibility.

**Touch-friendly, not touch-only.** The primary use context is a laptop or large tablet. Mobile is secondary but must work well — especially the event-day checklist.

---

## 2. Visual Reference

The provided Craftly Workspace design is the closest visual reference. Take from it:
- Dark sidebar on the left (desktop/tablet)
- White content area to the right
- Metric cards in a row at the top of dashboard
- Clean sans-serif typography
- Minimal color — black, white, and one accent color

Do NOT copy Craftly's layout literally. Adapt it to the firm's context.

---

## 3. Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#ffffff` | Main content area |
| `--color-sidebar` | `#0f172a` | Sidebar background |
| `--color-sidebar-text` | `#94a3b8` | Sidebar nav items (inactive) |
| `--color-sidebar-active` | `#ffffff` | Sidebar nav item (active) |
| `--color-sidebar-active-bg` | `#1e293b` | Active nav item background |
| `--color-accent` | `#6366f1` | Primary action buttons, links, active states |
| `--color-accent-hover` | `#4f46e5` | Button hover state |
| `--color-surface` | `#f8fafc` | Card backgrounds, input backgrounds |
| `--color-border` | `#e2e8f0` | Borders, dividers |
| `--color-text-primary` | `#0f172a` | Main body text |
| `--color-text-secondary` | `#64748b` | Labels, metadata, helper text |
| `--color-text-muted` | `#94a3b8` | Placeholder text, disabled states |

**Status colors:**
| Status | Color | Hex |
|---|---|---|
| Pending | Amber | `#f59e0b` |
| Approved / Success | Green | `#10b981` |
| Rejected / Danger | Red | `#ef4444` |
| In Progress / Info | Blue | `#3b82f6` |
| Completed | Gray | `#6b7280` |

---

## 4. Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Page title | Inter | 24px | 600 |
| Section heading | Inter | 18px | 600 |
| Card title | Inter | 15px | 500 |
| Body text | Inter | 14px | 400 |
| Labels / metadata | Inter | 13px | 400 |
| Small / helper text | Inter | 12px | 400 |
| Metric number | Inter | 28px | 600 |

Use Inter from Google Fonts. It renders cleanly on all screens and sizes.

Line height: 1.6 for body text, 1.3 for headings.

---

## 5. Layout Structure

### 5.1 Desktop / Tablet (768px+)

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (240px)  │  CONTENT AREA (flex-1)       │
│                   │                              │
│  Logo             │  Page header                 │
│  User info        │  ─────────────────────────   │
│                   │                              │
│  ─────────────    │  Content                     │
│  🏠 Dashboard     │                              │
│  👤 Clients       │                              │
│  📅 Calendar      │                              │
│  🏪 Vendors       │                              │
│  ✅ Approvals     │                              │
│  ⚙️ Settings      │                              │
│                   │                              │
│  ─────────────    │                              │
│  Avatar  Name     │                              │
│  Role    Logout   │                              │
└───────────────────┴──────────────────────────────┘
```

### 5.2 Mobile (< 768px)

```
┌─────────────────────┐
│  TopBar             │
│  EventFlow    [☰]   │
├─────────────────────┤
│                     │
│  Content area       │
│  (full width)       │
│                     │
│                     │
│                     │
├─────────────────────┤
│ 🏠   👤   📅   🏪  ☰│
│Bottom navigation bar│
└─────────────────────┘
```

Sidebar is hidden on mobile. Bottom navigation replaces it with 4 primary icons + a "More" overflow for secondary items.

---

## 6. Component Patterns

### 6.1 Metric Cards (Dashboard)

```
┌──────────────────────┐
│ Active Clients       │
│                      │
│    12                │
│                      │
└──────────────────────┘
```
- Background: `--color-surface`
- Border: 1px `--color-border`
- Border radius: 12px
- Padding: 20px
- Label: 13px, muted text, top
- Number: 28px, 600 weight, primary text

### 6.2 List / Table Rows

For client lists, vendor lists, approval queues:
- White background
- 1px bottom border between rows
- 52px row height (desktop), 60px (mobile — larger touch target)
- Hover state: `--color-surface` background
- Status pill on the right
- Click anywhere on row → navigates to detail

### 6.3 Status Pills

```
[ Pending ]        → amber bg, amber text
[ Approved ]       → green bg, green text
[ Rejected ]       → red bg, red text
[ Confirmed ]      → green bg, green text
[ Planning ]       → blue bg, blue text
[ Completed ]      → gray bg, gray text
```

Pill: 6px vertical padding, 12px horizontal padding, 20px border radius, 12px font, 500 weight.

### 6.4 Forms

- Full-width inputs on mobile, max 560px on desktop
- Shadcn form components (Input, Select, Textarea, DatePicker)
- Labels above inputs, not inside (placeholder only)
- Error messages below each field in red, 12px
- Primary action button: right-aligned, accent color
- Cancel / secondary: left-aligned or ghost button

### 6.5 Modals / Drawers

- Small actions (confirm delete, approve vendor): use Modal (centered dialog)
- Large forms (new client, new program): use Sheet (right-side drawer, slides in)
- Sheet width: 480px on desktop, full screen on mobile
- Always include a clear "X" close button and handle Escape key

### 6.6 Consultation Notes (Tiptap Editor)

```
┌────────────────────────────────────────┐
│ B  I  U  •  ≡  H1  H2               │  ← Toolbar
├────────────────────────────────────────┤
│                                        │
│ Meeting with Ahmed family – 8 Jun      │
│                                        │
│ Requirements discussed:                │
│ • Three programs: Holud, Mehendi,      │
│   Reception                           │
│ • Budget confirmed at ৳12–15 lakh     │
│ • Royal blue theme for reception       │
│                                        │
└────────────────────────────────────────┘
│ Last saved: 2 minutes ago             │
```
- Light border, white background
- Minimum height: 240px, expands as user types
- Auto-save every 30 seconds (shows "Saving..." / "Saved" indicator)
- Font: 14px, 1.7 line height — comfortable for reading

### 6.7 Event-Day Checklist (Mobile-first)

```
┌────────────────────────────────────┐
│ Reception Checklist    3/12 done   │
│ ████░░░░░░░░  25%                 │
├────────────────────────────────────┤
│ DECORATION                         │
│ ┌─────────────────────────────┐    │
│ │ ☑  Stage frame delivered    │    │
│ │     Shaswata · 9:42 AM      │    │
│ └─────────────────────────────┘    │
│ ┌─────────────────────────────┐    │
│ │ ☐  Entrance arch complete   │    │
│ │     Assigned: Shaswata      │    │
│ └─────────────────────────────┘    │
├────────────────────────────────────┤
│ CATERING                           │
│ ┌─────────────────────────────┐    │
│ │ ☑  Catering team arrived    │    │
│ └─────────────────────────────┘    │
└────────────────────────────────────┘
```

- Checkbox: 24px touch target minimum
- Completed tasks: strikethrough text, muted color, show who ticked + time
- Department sections: sticky header as user scrolls
- Progress bar at top: updates in real time

---

## 7. Calendar Screen

Use FullCalendar with a custom event renderer:

```
Each event block shows:
┌────────────────────┐
│ Ahmed Family       │  ← Client name (bold, 13px)
│ Reception          │  ← Program name (12px)
└────────────────────┘
```

Color coding by program status:
- Planning → blue
- Vendors Sourcing → amber
- Ready → green
- Live → accent (indigo)
- Completed → gray

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Single column, bottom nav, full-width sheets |
| Tablet | 640px – 1024px | Sidebar (collapsible), 2-column grids |
| Desktop | > 1024px | Fixed sidebar, 3-column dashboard, data tables |

Tailwind breakpoints: `sm:` (640), `md:` (768), `lg:` (1024), `xl:` (1280)

---

## 9. Accessibility

- All interactive elements have visible focus rings (`outline-offset-2`, `ring-2`)
- Color is never the only indicator of status (always paired with text label)
- All form inputs have associated labels (`<label htmlFor>`)
- Images have alt text
- Modal traps focus when open, returns focus on close
- Minimum tap target: 44px × 44px on mobile

---

## 10. Loading & Empty States

**Loading:** Use Shadcn `Skeleton` components — animated gray bars that match the shape of the content loading. Never use a full-page spinner.

**Empty states (no data yet):**
```
        [Icon]
  No clients yet
  Add your first client to get started
  [ + Add Client ]
```
Every list page needs an empty state with a clear call-to-action.

**Error states:** Toast notification (bottom-right, 4 second auto-dismiss) for failed saves. Inline error message below the field for validation errors.

---

## 11. Key UX Decisions

**No confirmation dialogs for low-risk actions.** Marking a checklist task as done, saving a note, or adding a vendor to the database should happen instantly. Only use a confirmation dialog for destructive actions (delete client, reject approval).

**Breadcrumbs for deep pages.** Client → Programs → Holud → Vendors helps partners orient themselves when navigating deep into a client's event.

**Sticky action bar on long forms.** On new client or new program forms, keep the Save/Cancel button bar fixed at the bottom of the screen so users never have to scroll to submit.

**Search everywhere.** A global search (keyboard shortcut: Ctrl/Cmd + K) should be able to find clients by name, vendors by name, or programs by date. This is especially useful for Sumit looking up a vendor quickly during sourcing.
