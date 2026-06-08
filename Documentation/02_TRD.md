# Technical Requirements Document (TRD)
## EventFlow — Internal Event Management System
**Version:** 1.0  
**Date:** June 2026  
**Status:** Ready for Development  

---

## 1. Technology Stack

### 1.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14+ (App Router) | React framework, SSR, routing, PWA |
| React | 18+ | UI component library |
| TypeScript | 5+ | Type safety across entire codebase |
| Tailwind CSS | 3+ | Utility-first styling |
| Shadcn/UI | Latest | Pre-built accessible component library |
| Zustand | 4+ | Lightweight client-side state management |
| React Hook Form | 7+ | Form state and validation |
| Zod | 3+ | Schema validation (shared with backend) |
| Tiptap | 2+ | Rich-text editor for consultation notes |
| FullCalendar | 6+ | Event calendar (month/week/day views) |
| date-fns | 3+ | Date formatting and manipulation |
| @tanstack/react-query | 5+ | Server state, caching, background refetch |

### 1.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Supabase | Latest | Backend-as-a-Service platform |
| PostgreSQL | 15+ | Primary database (via Supabase) |
| Supabase Auth | — | Authentication, session management, JWT |
| Supabase Storage | — | File storage for bills, images, documents |
| Supabase Realtime | — | Live updates for checklists and activity feed |
| Row Level Security (RLS) | — | Database-level role enforcement |

### 1.3 Deployment

| Service | Purpose |
|---|---|
| Vercel | Next.js hosting, PWA deployment, automatic HTTPS |
| Supabase Cloud | Database, auth, storage (Singapore region) |
| GitHub | Version control, CI/CD trigger |

---

## 2. Project Structure

```
eventflow/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Sidebar + shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── clients/
│   │   │   ├── page.tsx          # Client list
│   │   │   ├── new/page.tsx      # New client form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Client detail
│   │   │       └── programs/
│   │   │           ├── page.tsx
│   │   │           └── [programId]/page.tsx
│   │   ├── calendar/
│   │   │   └── page.tsx
│   │   ├── vendors/
│   │   │   ├── page.tsx          # Vendor database
│   │   │   └── [id]/page.tsx
│   │   ├── approvals/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/                      # API routes (minimal — most logic via Supabase client)
│       └── auth/
│           └── callback/route.ts
├── components/
│   ├── ui/                       # Shadcn generated components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileNav.tsx
│   ├── clients/
│   │   ├── ClientCard.tsx
│   │   ├── ClientForm.tsx
│   │   └── ConsultationEditor.tsx
│   ├── programs/
│   │   ├── ProgramCard.tsx
│   │   ├── ProgramForm.tsx
│   │   └── ServiceCategoryRow.tsx
│   ├── vendors/
│   │   ├── VendorCard.tsx
│   │   ├── VendorAssignmentForm.tsx
│   │   └── ApprovalBadge.tsx
│   ├── calendar/
│   │   └── EventCalendar.tsx
│   ├── checklist/
│   │   ├── ChecklistBoard.tsx
│   │   └── TaskRow.tsx
│   └── dashboard/
│       ├── MetricCard.tsx
│       ├── ActivityFeed.tsx
│       └── UpcomingEvents.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client (for SSR)
│   │   └── middleware.ts         # Auth middleware
│   ├── stores/
│   │   ├── authStore.ts          # Zustand: current user + role
│   │   └── uiStore.ts            # Zustand: sidebar state, modals
│   ├── hooks/
│   │   ├── useClients.ts
│   │   ├── usePrograms.ts
│   │   ├── useVendors.ts
│   │   └── useApprovals.ts
│   ├── validators/
│   │   ├── clientSchema.ts       # Zod schemas
│   │   ├── programSchema.ts
│   │   └── vendorSchema.ts
│   └── utils/
│       ├── formatters.ts         # Currency, date formatting
│       └── permissions.ts        # Role-check helpers
├── types/
│   └── database.types.ts         # Auto-generated from Supabase
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/                    # PWA icons (192, 512px)
├── middleware.ts                 # Route protection
├── next.config.js
└── tailwind.config.ts
```

---

## 3. Authentication

### 3.1 Supabase Auth Setup

- Email + password authentication only (no social login in MVP)
- Sessions managed via Supabase JWT tokens
- Session stored in cookies (httpOnly, secure) via `@supabase/ssr`
- Auto-refresh on token expiry
- Middleware protects all `/dashboard/*` routes — redirects to `/login` if unauthenticated

### 3.2 Role Implementation

Roles are stored in a `user_profiles` table (not in auth metadata). On login, the app fetches the user's role and stores it in Zustand.

```typescript
// lib/stores/authStore.ts
interface AuthState {
  user: User | null
  role: UserRole | null
  profile: UserProfile | null
}

type UserRole = 
  | 'managing_director'
  | 'finance_manager' 
  | 'client_comms'
  | 'vendor_manager'
  | 'operations'
  | 'decoration'
  | 'design'
```

### 3.3 Route Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Check session — redirect to /login if missing
  // Role-based page guards handled in individual page components
}
```

### 3.4 Permission Helper

```typescript
// lib/utils/permissions.ts
export const can = (role: UserRole, action: string): boolean => {
  const permissions: Record<string, UserRole[]> = {
    'create_client':         ['managing_director', 'client_comms'],
    'approve_vendor_finance':['finance_manager'],
    'approve_vendor_md':     ['managing_director'],
    'assign_vendor':         ['managing_director', 'vendor_manager', 'decoration'],
    'manage_checklist':      ['managing_director', 'operations', 'decoration'],
  }
  return permissions[action]?.includes(role) ?? false
}
```

---

## 4. Database Access Pattern

### 4.1 Supabase Client Usage

- **Server Components (SSR):** Use `createServerClient` from `@supabase/ssr`
- **Client Components:** Use `createBrowserClient`
- **React Query:** Wraps all Supabase calls for caching, loading states, and background refetch

```typescript
// lib/hooks/useClients.ts
export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*, created_by_user:user_profiles(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })
}
```

### 4.2 Row Level Security

All tables have RLS enabled. Policies enforce role-based access at the database level — the application layer permissions are a UX convenience; RLS is the actual security boundary.

Example policies:

```sql
-- Only MD and client_comms can insert clients
CREATE POLICY "insert_clients" ON clients
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM user_profiles 
      WHERE role IN ('managing_director', 'client_comms')
    )
  );

-- All authenticated users can read clients
CREATE POLICY "read_clients" ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

---

## 5. Real-time Features

Supabase Realtime is used for:

- **Event-day checklist:** Task tick updates broadcast to all connected devices instantly
- **Approval notifications:** Approver sees a badge update without page refresh
- **Activity feed:** New entries appear in real time

```typescript
// components/checklist/ChecklistBoard.tsx
useEffect(() => {
  const channel = supabase
    .channel('checklist-' + programId)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'event_checklists',
      filter: `program_id=eq.${programId}`
    }, (payload) => {
      queryClient.invalidateQueries(['checklist', programId])
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [programId])
```

---

## 6. File Storage

### 6.1 Bucket Structure

```
supabase-storage/
├── bills/
│   └── {vendor_assignment_id}/{filename}
├── contracts/
│   └── {program_id}/{filename}
└── references/
    └── {client_id}/{filename}
```

### 6.2 Upload Flow

```typescript
async function uploadDocument(file: File, bucket: string, path: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false })
  
  if (error) throw error
  
  // Save reference in documents table
  await supabase.from('documents').insert({
    file_url: data.path,
    file_type: file.type,
    label: 'bill',
    uploaded_by: currentUser.id
  })
}
```

### 6.3 Signed URLs

All file access uses time-limited signed URLs (1 hour expiry). No public bucket access.

---

## 7. PWA Configuration

```json
// public/manifest.json
{
  "name": "EventFlow",
  "short_name": "EventFlow",
  "description": "Internal event management system",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f172a",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Service Worker:** Handled by `next-pwa` package. Caches:
- App shell (layout, navigation)
- Static assets
- Checklist page (offline-first for event-day use)

---

## 8. Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server only — never exposed to client

# Approval thresholds (configurable)
NEXT_PUBLIC_APPROVAL_THRESHOLD_FINANCE=50000
NEXT_PUBLIC_APPROVAL_THRESHOLD_MD=100000
```

---

## 9. TypeScript Types

Auto-generate database types from Supabase:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

Re-run after every schema migration.

---

## 10. Key Technical Constraints

| Constraint | Decision |
|---|---|
| No separate mobile app | PWA only — one codebase |
| No Google Calendar | Custom FullCalendar component |
| No external chat | Activity feed replaces notifications |
| No client login | Internal only — 7 users maximum in MVP |
| No billing engine | Quotation is a document, not a ledger |
| Offline checklist | Service worker caches checklist page |
| File size limit | 10MB enforced client-side before upload |
| Image formats | PDF, JPG, PNG, WEBP only |
