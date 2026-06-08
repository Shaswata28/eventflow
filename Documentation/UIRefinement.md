web application/stitch/projects/2885911656850689401/screens/e5380bcab5154880ad78f5c9a375c681
# EventFlow: Obsidian System

## Product Overview

**The Pitch:** A high-utility, rigorous event operations management system built for Bangladeshi event planning firms. It transforms chaotic wedding and corporate event planning into a structured, trackable, and flawless execution pipeline.

**For:** Event managers, coordinators, and vendors who need pixel-perfect clarity on timelines, budgets, and checklists amidst high-pressure event days.

**Device:** desktop

**Design Direction:** High-contrast utility. A stark #0f172a dark sidebar anchors a brilliant white content canvas, accented by electric indigo. 

**Inspired by:** Linear, Vercel

---

## Screens

- **Dashboard:** Mission control for active events, recent activity, and high-level metrics
- **Client List:** Searchable, filterable directory of all past and active clients
- **Client Detail:** Central hub for a specific client's notes, programs, and documents
- **Program Detail:** Granular view of a specific event (e.g., Gaye Holud, Reception) with budget and checklist tabs
- **Event Day Checklist:** Real-time, department-grouped execution tracker with progress indicators
- **Vendor Database:** Visual grid of available vendors categorized by service type

---

## Key Flows

**Executing an Event Day:** Event manager tracks live progress

1. User is on **Dashboard** -> sees `Today's Events` widget
2. User clicks `[Reception: Ahmed-Rahman]` -> opens **Event Day Checklist**
3. User toggles `[Catering Arrived]` checkbox -> progress bar advances to `45%`, timestamp logged

---

<details>
<summary>Design System</summary>

## Color Palette

- **Primary:** `#6366f1` - Buttons, active tabs, progress bars
- **Sidebar:** `#0f172a` - Left navigation pane
- **Background:** `#ffffff` - Main content area
- **Surface:** `#f8fafc` - Cards, table headers, hovered rows
- **Text:** `#020617` - Primary headings, body copy
- **Muted:** `#64748b` - Secondary text, borders, placeholders
- **Accent:** `#10b981` - Success states, completed checklists

## Typography

Using **Geist** to elevate the linear aesthetic while avoiding generic defaults.

- **Headings:** Geist, 600, 24-32px, `-0.02em` tracking
- **Body:** Geist, 400, 14px, `1.5` line-height
- **Data/Metrics:** Geist Mono, 500, 13px
- **Buttons:** Geist, 500, 14px

**Style notes:** 12px border radius on all cards, 1px solid `#e2e8f0` borders, zero drop shadows (flat design), tight spacing grid (8px increments).

## Design Tokens

```css
:root {
  --color-primary: #6366f1;
  --color-sidebar: #0f172a;
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #020617;
  --color-muted: #64748b;
  --color-border: #e2e8f0;
  --font-primary: 'Geist', sans-serif;
  --font-mono: 'Geist Mono', monospace;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

</details>

---

<details>
<summary>Screen Specifications</summary>

### Dashboard

**Purpose:** Morning briefing for event managers

**Layout:** 240px fixed dark sidebar, fluid white main area. Top metrics row, split column bottom (activity left, upcoming right).

**Key Elements:**
- **Metrics Row:** 4 cards, 12px radius. `Active Clients`, `Events This Week`, `Pending Invoices`.
- **Upcoming Events List:** Compact list, date badge left (`#f8fafc` bg), bold title right.
- **Global Search:** `Ctrl+K` trigger in header, 400px wide, `#f8fafc` bg.

**States:**
- **Empty:** "No upcoming events this week. Time to prep."
- **Loading:** Skeleton pulses, `#f1f5f9`.

**Components:**
- **Sidebar Link:** 14px, `#94a3b8` text. Active state: `#ffffff` text, `#1e293b` bg, 6px radius.

**Interactions:**
- **Hover row:** Background transitions to `#f8fafc` (150ms ease).

### Client List

**Purpose:** Directory of event clientele

**Layout:** Standard table layout with top action bar.

**Key Elements:**
- **Filter Bar:** Search input (240px), Dropdown (`Status: Active/Archived`), `+ New Client` button (`#6366f1` bg).
- **Data Table:** Columns: `ID`, `Name`, `Event Dates`, `Status`, `Budget`. Monospace `ID`s.
- **Status Badges:** `Active` (`#dbeafe` bg, `#1d4ed8` text), `Lead` (`#fef3c7` bg, `#b45309` text).

**States:**
- **Empty:** Centered graphic, "Add your first client".

**Interactions:**
- **Click row:** Routes to Client Detail.

### Client Detail

**Purpose:** 360-degree view of a client engagement

**Layout:** Header with client name/meta, sticky tab navigation underneath, dynamic content area.

**Key Elements:**
- **Header:** 32px Geist 600, client phone/email in Geist Mono 13px below.
- **Tabs:** `Overview`, `Notes`, `Programs`, `Docs`. Active tab has 2px `#6366f1` bottom border.
- **Programs List (Tab):** Grid of cards for individual events (e.g., `Mehendi`, `Walima`).

**Components:**
- **Program Card:** 12px radius, 1px border. Shows date, venue, status.

### Program Detail

**Purpose:** Granular management of a specific event

**Layout:** Similar to Client Detail but deeper context. Split view in Overview tab (details left, quick actions right).

**Key Elements:**
- **Breadcrumbs:** `Clients / Ahmed-Rahman / Walima`
- **Budget Widget:** Mini progress bar showing `Spent vs Allocated` (`#10b981` if under, `#ef4444` if over).
- **Quick Actions:** Stacked buttons (`Generate Run Sheet`, `Message Vendors`).

### Event Day Checklist

**Purpose:** Live execution tracking on the day of the event

**Layout:** Full-width focus mode. Left column department filters, right column tasks.

**Key Elements:**
- **Master Progress Bar:** Sticky top, 8px high, `#6366f1` fill, animated width transition.
- **Department Groups:** `Catering`, `Decor`, `Logistics`, `Sound & Light`.
- **Task Row:** 24px checkbox (`accent-color: #6366f1`), label, assigned vendor, timestamp.

**States:**
- **Checked:** Label strikes through, text turns `#64748b`.

**Interactions:**
- **Click Checkbox:** Updates progress bar immediately, flashes `#10b981` briefly.

### Vendor Database

**Purpose:** Sourcing and managing third-party suppliers

**Layout:** Filter sidebar left (160px), responsive masonry/grid right.

**Key Elements:**
- **Category List:** List of filters (`Decorators`, `Photographers`, `Caterers`, `Makeup Artists`).
- **Vendor Card:** Image top (120px height, object-fit cover), Name, Rating (`★ 4.8`), Base Price badge (`Geist Mono`).
- **Tag:** Small pill tags (`#f1f5f9` bg) for specialties (e.g., `Floral`, `Lighting`).

</details>

---

<details>
<summary>Build Guide</summary>

**Stack:** HTML + Tailwind CSS v3

**Build Order:**
1. **Layout Shell (Sidebar + Header):** Establishes the `#0f172a` anchoring and typography scale.
2. **Dashboard:** Builds core UI components (cards, typography, metrics).
3. **Event Day Checklist:** Builds the complex interactive elements (progress bars, custom checkboxes).
4. **Client List & Table:** Standardizes table layouts and badges.
5. **Client/Program Details:** Implements tabs and nested layouts.
6. **Vendor Database:** Builds the responsive card grid system.

</details>