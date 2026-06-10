import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type VendorPaymentRow = Database['public']['Tables']['vendor_payments']['Row']
type VendorPaymentInsert = Database['public']['Tables']['vendor_payments']['Insert']

export type EnrichedVendorPayment = VendorPaymentRow & {
  paid_by_user?: { name: string } | null
}

/**
 * Fetch all payments for a given vendor assignment, ordered by paid_at ascending.
 */
export function useVendorPayments(assignmentId: string | null) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['vendor_payments', assignmentId],
    queryFn: async () => {
      if (!assignmentId) return []

      const { data, error } = await supabase
        .from('vendor_payments')
        .select('*, paid_by_user:user_profiles!vendor_payments_paid_by_fkey(name)')
        .eq('vendor_assignment_id', assignmentId)
        .order('paid_at', { ascending: true })

      if (error) throw error
      return (data || []) as EnrichedVendorPayment[]
    },
    enabled: !!assignmentId,
  })
}

/**
 * Log a new payment for a vendor assignment.
 * Automatically handles status transitions:
 * - advance payment on an 'approved' assignment → status becomes 'confirmed'
 * - total payments >= quoted price → status becomes 'fully_paid'
 */
export function useLogPayment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      payment,
      quotedPrice,
      currentTotalPaid,
      currentStatus,
    }: {
      payment: VendorPaymentInsert
      quotedPrice: number
      currentTotalPaid: number
      currentStatus: string
    }) => {
      // 1. Insert the payment
      const { data, error } = await (supabase.from('vendor_payments') as any)
        .insert(payment)
        .select('*, paid_by_user:user_profiles!vendor_payments_paid_by_fkey(name)')
        .single()

      if (error) throw error
      const paymentData = data as EnrichedVendorPayment

      // 2. Determine if status should change
      const newTotalPaid = currentTotalPaid + (payment.payment_type === 'refund' ? -payment.amount : payment.amount)

      let newStatus: string | null = null

      // advance payment on an approved vendor → confirmed
      if (payment.payment_type === 'advance' && currentStatus === 'approved') {
        newStatus = 'confirmed'
      }

      // total paid >= quoted price → fully_paid
      if (newTotalPaid >= quotedPrice && currentStatus !== 'fully_paid') {
        newStatus = 'fully_paid'
      }

      if (newStatus) {
        const { error: updateError } = await (supabase as any)
          .from('vendor_assignments')
          .update({ status: newStatus })
          .eq('id', payment.vendor_assignment_id)

        if (updateError) {
          console.error('Failed to update assignment status:', updateError)
          // Don't throw — payment was already saved successfully
        }
      }

      return paymentData
    },
    onSuccess: (data) => {
      // Invalidate payments for this assignment
      queryClient.invalidateQueries({ queryKey: ['vendor_payments', data.vendor_assignment_id] })
      // Invalidate the parent service categories query to refresh totals and statuses
      queryClient.invalidateQueries({ queryKey: ['service_categories'] })
    },
  })
}
