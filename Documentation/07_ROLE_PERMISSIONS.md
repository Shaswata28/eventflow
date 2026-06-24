# Role & Permission Matrix
## MoonVeil Workspace — Internal System Access Control
**Date:** June 2026

This document outlines the strict Role-Based Access Control (RBAC) enforced by the PostgreSQL Row Level Security (RLS) policies in the database.

---

## 1. Global Rules (Apply to Everyone)
Transparency is a core principle of MoonVeil Workspace. Therefore, **all authenticated users** regardless of role have the ability to:
- **View:** The dashboard, client lists, event programs, vendor directory, and all checklists.
- **Log Activity:** Append to the system activity log (automatically).
- **Checklist Execution:** Update and tick off tasks as "Done" on the event checklists.

---

## 2. Role-Specific Permissions

### 👑 Managing Director (`managing_director`)
*The ultimate administrator with full access to all system modules.*
- **System Administration:** Can view all user profiles in the system.
- **Clients & Programs:** Can create and edit clients, notes, and event programs.
- **Vendors & Budgets:** Can create vendors, assign vendors to programs, and edit service categories.
- **Approvals:** Can resolve (approve/reject) Level 2 high-budget vendor assignments.
- **Operations:** Can create new tasks in event checklists.

### 💰 Finance Manager (`finance_manager`)
*Controls the flow of money and high-level vendor approvals.*
- **Approvals:** Can view and resolve (approve/reject) Level 1 vendor assignments that cross budget thresholds.
- *(Note: They rely on the global read access for viewing contexts but do not have write access to clients or vendors).*

### 🗣️ Client Communications (`client_comms`)
*Manages front-facing client relationships and initial planning.*
- **Clients:** Can create new clients and update client details.
- **Notes:** Can log rich-text consultation notes for clients.
- **Programs:** Can create new event programs (e.g., locking in a date for a Reception) and edit program details.
- **Budgets:** Can create and manage service categories for a program.

### 🤝 Vendor Manager (`vendor_manager`)
*Procurement and external relationship management.*
- **Vendors:** Can add new vendors to the global directory and edit vendor profiles.
- **Assignments:** Can assign vendors to specific service categories for a program.
- **Budgets:** Can create and manage service categories.

### 🎨 Decoration (`decoration`)
*Creative execution and specialized vendor management.*
- **Vendors:** Can add new vendors to the global directory and edit vendor profiles.
- **Assignments:** Can assign vendors to specific service categories for a program.
- **Budgets:** Can create and manage service categories.
- **Operations:** Can create new tasks in event checklists.

### 📐 Design (`design`)
*Visual and creative planning.*
- *(Note: Currently relies on global read access and global task execution. No specific write privileges defined beyond the baseline).*

### ⚙️ Operations (`operations`)
*Ground execution and live event management.*
- **Operations:** Can create new tasks in event checklists.
- *(Note: They are the primary executors of tasks, utilizing their global ability to tick off completed items on the ground).*

---

## 3. Module Breakdown Summary

| Module / Action | Who can Write / Edit / Create? |
| :--- | :--- |
| **User Profiles (Read All)** | `managing_director` |
| **Clients & Notes** | `managing_director`, `client_comms` |
| **Event Programs** | `managing_director`, `client_comms` |
| **Service Categories** | `managing_director`, `client_comms`, `vendor_manager`, `decoration` |
| **Vendors Directory** | `managing_director`, `vendor_manager`, `decoration` |
| **Vendor Assignments** | `managing_director`, `vendor_manager`, `decoration` |
| **Approvals (Resolve)** | `managing_director`, `finance_manager` |
| **Checklists (Create Task)** | `managing_director`, `operations`, `decoration` |
| **Checklists (Tick Task)** | **Everyone** |

*Note: All enforcement happens at the database level via Supabase RLS. UI buttons may occasionally appear for unauthorized users, but database saves will strictly block unauthorized actions.*
