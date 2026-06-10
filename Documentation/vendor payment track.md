### question : we need to add some features like when we add a vendor and its confirmed by MD and finance we need to track how much we paid to that vendor for that program . ( like how much is paid in advance and how much is left to be paid).


Good — this is already partially built into the schema. The `vendor_assignments` table already has `advance_paid`, `remaining_balance` (computed), and `quoted_price`. But you're right that we need to think through the full payment tracking flow properly, because right now it only handles a single advance payment. Real vendor payments often happen in multiple installments.

---

## The gap in the current design

Right now the flow is:

```
Vendor assigned → Approved → Pay advance once → Confirmed
```

But in reality it's often:

```
Vendor assigned → Approved → Pay advance 1 → Pay advance 2 → Pay on event day → Fully paid
```

A single `advance_paid` field can't track that history.

---

## What needs to be added

One new table — `vendor_payments`. Instead of storing one advance amount on the assignment, you store each payment as a separate row.

```sql
CREATE TYPE payment_type AS ENUM (
  'advance',        -- initial booking advance
  'installment',    -- mid-payment before event
  'final',          -- payment on/after event day
  'refund'          -- if overpaid or cancelled
);

CREATE TABLE vendor_payments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_assignment_id  UUID NOT NULL REFERENCES vendor_assignments(id) ON DELETE CASCADE,
  amount                NUMERIC(12, 2) NOT NULL,
  payment_type          payment_type NOT NULL DEFAULT 'advance',
  paid_by               UUID NOT NULL REFERENCES user_profiles(id),
  paid_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note                  TEXT,
  bill_url              TEXT,    -- receipt/bill for this specific payment
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Then on `vendor_assignments`, remove the static `advance_paid` column and make it a computed view instead:

```sql
-- Add this view so you can still query totals easily
CREATE VIEW vendor_assignment_payment_summary AS
SELECT
  va.id AS vendor_assignment_id,
  va.quoted_price,
  COALESCE(SUM(
    CASE WHEN vp.payment_type != 'refund' THEN vp.amount ELSE -vp.amount END
  ), 0) AS total_paid,
  va.quoted_price - COALESCE(SUM(
    CASE WHEN vp.payment_type != 'refund' THEN vp.amount ELSE -vp.amount END
  ), 0) AS balance_due
FROM vendor_assignments va
LEFT JOIN vendor_payments vp ON vp.vendor_assignment_id = va.id
GROUP BY va.id, va.quoted_price;
```

---

## How it looks in the UI

On the Budget & Vendors tab, each service category row expands to show a payment timeline:

```
┌─────────────────────────────────────────────────────────┐
│ Decor — Neon Stage                    Confirmed    [+]  │
│ Quoted: ৳1,80,000                                       │
├─────────────────────────────────────────────────────────┤
│ PAYMENTS                                                │
│                                                         │
│ ✓ Advance      ৳50,000    Jun 8   Sumit   [receipt]    │
│ ✓ Installment  ৳60,000    Jun 20  Sumit   [receipt]    │
│ ○ Final        ৳70,000    Due: Aug 17 (event day)      │
│                                                         │
│ Paid so far:  ৳1,10,000                                 │
│ Balance due:  ৳70,000          [+ Log Payment]         │
└─────────────────────────────────────────────────────────┘
```

The **"+ Log Payment"** button is visible only to Vendor Manager, Decoration, and MD. Finance Manager sees the payment history read-only.

---

## Updated TypeScript types to add

```typescript
// Add to database.types.ts

export type PaymentType = 'advance' | 'installment' | 'final' | 'refund'

// In Tables:
vendor_payments: {
  Row: {
    id:                   string
    vendor_assignment_id: string
    amount:               number
    payment_type:         PaymentType
    paid_by:              string
    paid_at:              string
    note:                 string | null
    bill_url:             string | null
    created_at:           string
  }
  Insert: {
    id?:                   string
    vendor_assignment_id:  string
    amount:                number
    payment_type?:         PaymentType
    paid_by:               string
    paid_at?:              string
    note?:                 string | null
    bill_url?:             string | null
  }
  Update: {
    note?:       string | null
    bill_url?:   string | null
  }
  Relationships: [
    {
      foreignKeyName: "vendor_payments_assignment_id_fkey"
      columns: ["vendor_assignment_id"]
      referencedRelation: "vendor_assignments"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "vendor_payments_paid_by_fkey"
      columns: ["paid_by"]
      referencedRelation: "user_profiles"
      referencedColumns: ["id"]
    }
  ]
}

// Composite type for UI
export type VendorPayment = Tables<"vendor_payments">

export type AssignmentWithPayments = VendorAssignment & {
  vendor:           Vendor | null
  vendor_payments:  VendorPayment[]
  total_paid:       number    // computed client-side or from view
  balance_due:      number    // quoted_price - total_paid
}
```

---

## The hook you'll write

```typescript
// lib/hooks/useVendorPayments.ts

export function useVendorPayments(assignmentId: string) {
  return useQuery({
    queryKey: ['vendor_payments', assignmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_payments')
        .select('*, paid_by_user:user_profiles(name)')
        .eq('vendor_assignment_id', assignmentId)
        .order('paid_at', { ascending: true })
      if (error) throw error
      return data
    }
  })
}

export function useLogPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payment: TablesInsert<'vendor_payments'>) => {
      const { data, error } = await supabase
        .from('vendor_payments')
        .insert(payment)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      // Invalidate payments list + assignment summary
      queryClient.invalidateQueries(['vendor_payments', data.vendor_assignment_id])
      queryClient.invalidateQueries(['service_categories'])
      // Log to activity feed
    }
  })
}
```

---

## One rule to enforce

A vendor's total payments should never exceed the quoted price. Add a client-side check before logging a payment:

```typescript
if (newPaymentAmount + totalAlreadyPaid > quotedPrice) {
  toast.error(`This payment exceeds the quoted amount. 
    Max you can log: ৳${quotedPrice - totalAlreadyPaid}`)
  return
}
```

This prevents accidental overpayment entries. Run this check in the UI before the insert — no need for a database constraint for MVP.

---

**SQL migration to run in Supabase** — just two things: add the `vendor_payments` table and the summary view. You don't need to drop anything from `vendor_assignments` yet — keep `advance_paid` as a legacy column for now and stop writing to it once the new table is live. Clean it up later.


### question:  multiple advance payment option should be optional like 1 advance payment is mandatory . then the vendor will be paid after event .


Perfect — that simplifies it significantly. Here's the exact rule:

```
1 mandatory advance → [optional extra installments] → 1 final payment after event
```

---

## Simplified payment flow

```
Vendor Approved
      │
      ▼
Log Advance Payment (mandatory)
amount + receipt upload
      │
      ▼
Status → "Confirmed"
      │
      ▼
[Optional] Log more installments
anytime before event day
      │
      ▼
Event happens
      │
      ▼
Log Final Payment (after event)
Status → "Fully Paid"
```

The `+ Log Payment` button stays visible after the first advance — but the **first payment is enforced** before the vendor can be marked Confirmed.

---

## Small schema adjustment

Keep the `vendor_payments` table exactly as designed. Just enforce the rule in the UI logic, not the database:

```typescript
// lib/utils/payments.ts

export function canMarkConfirmed(payments: VendorPayment[]): boolean {
  // Must have at least one advance payment logged
  return payments.some(p => p.payment_type === 'advance')
}

export function canLogFinalPayment(payments: VendorPayment[]): boolean {
  // Final payment only after event date has passed
  // and no final payment already exists
  const today = new Date()
  const eventDate = new Date(eventProgram.event_date)
  const alreadyPaid = payments.some(p => p.payment_type === 'final')
  return today >= eventDate && !alreadyPaid
}

export function getPaymentSummary(payments: VendorPayment[], quotedPrice: number) {
  const totalPaid = payments.reduce((sum, p) =>
    p.payment_type === 'refund' ? sum - p.amount : sum + p.amount, 0
  )
  return {
    totalPaid,
    balanceDue: quotedPrice - totalPaid,
    isFullyPaid: totalPaid >= quotedPrice,
    hasAdvance: payments.some(p => p.payment_type === 'advance'),
  }
}
```

---

## How the UI enforces this

```
BEFORE advance is logged:
┌──────────────────────────────────────────────────┐
│ Neon Stage Decor              [Approved]         │
│ Quoted: ৳1,80,000                                │
│                                                  │
│ ⚠ Log advance payment to confirm this vendor    │
│                          [Log Advance Payment]   │
└──────────────────────────────────────────────────┘

AFTER advance is logged:
┌──────────────────────────────────────────────────┐
│ Neon Stage Decor              [Confirmed]        │
│ Quoted: ৳1,80,000                                │
│                                                  │
│ ✓ Advance   ৳50,000   Jun 8   Sumit  [receipt]  │
│                                                  │
│ Paid: ৳50,000  │  Balance: ৳1,30,000            │
│              [+ Add Installment]  (optional)     │
└──────────────────────────────────────────────────┘

AFTER event day:
┌──────────────────────────────────────────────────┐
│ Neon Stage Decor              [Confirmed]        │
│ Quoted: ৳1,80,000                                │
│                                                  │
│ ✓ Advance      ৳50,000   Jun 8    Sumit         │
│ ✓ Installment  ৳60,000   Jun 20   Sumit         │
│                                                  │
│ Paid: ৳1,10,000  │  Balance: ৳70,000            │
│                        [Log Final Payment]       │
└──────────────────────────────────────────────────┘

FULLY PAID:
┌──────────────────────────────────────────────────┐
│ Neon Stage Decor              [Fully Paid] ✓     │
│ Quoted: ৳1,80,000  │  Total Paid: ৳1,80,000     │
│                                                  │
│ ✓ Advance   ৳50,000   Jun 8                     │
│ ✓ Installment ৳60,000 Jun 20                    │
│ ✓ Final     ৳70,000   Aug 17                    │
└──────────────────────────────────────────────────┘
```

---

## Payment type rules summarized

|Type|When|Mandatory|How many|Unlocks|
|---|---|---|---|---|
|`advance`|After approval|Yes — 1 required|Exactly 1|Confirms the vendor|
|`installment`|Any time before event|No|Unlimited|Nothing, just tracking|
|`final`|On/after event date|No, but expected|Exactly 1|Marks "Fully Paid"|
|`refund`|Anytime|No|Unlimited|Nothing|

---

## Status progression on vendor_assignment

```
pending_approval → approved → confirmed → fully_paid
                                  ↑
                        (after advance logged)
```

Add `fully_paid` to your `assignment_status` enum in Supabase:

```sql
ALTER TYPE assignment_status ADD VALUE 'fully_paid';
```

And update it automatically when final payment is logged:

```typescript
// After inserting a 'final' payment
const { totalPaid } = getPaymentSummary(allPayments, quotedPrice)
if (totalPaid >= quotedPrice) {
  await supabase
    .from('vendor_assignments')
    .update({ status: 'fully_paid' })
    .eq('id', assignmentId)
}
```

That's the complete payment tracking system — simple, enforced where it matters, flexible where it doesn't need to be rigid.