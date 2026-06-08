import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type ServiceCategoryRow = Database['public']['Tables']['service_categories']['Row']
type ServiceCategoryInsert = Database['public']['Tables']['service_categories']['Insert']
type VendorAssignmentRow = Database['public']['Tables']['vendor_assignments']['Row'] & { vendor?: { name: string } | null }
type VendorAssignmentInsert = Database['public']['Tables']['vendor_assignments']['Insert']
type ApprovalRequestInsert = Database['public']['Tables']['approval_requests']['Insert']

export function useServiceCategories(programId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['service_categories', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select(`
          *,
          assignments:vendor_assignments(
            *,
            vendor:vendors(name)
          )
        `)
        .eq('program_id', programId)

      if (error) throw error
      return data as (ServiceCategoryRow & { assignments: VendorAssignmentRow[] })[]
    },
    enabled: !!programId,
  })
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (newCategory: ServiceCategoryInsert) => {
      const { data, error } = await supabase
        .from('service_categories')
        .insert(newCategory as any)
        .select()
        .single()

      if (error) throw error
      return data as ServiceCategoryRow
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service_categories', variables.program_id] })
    },
  })
}

export function useCreateVendorAssignment() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ assignment, approval }: { assignment: VendorAssignmentInsert, approval?: Omit<ApprovalRequestInsert, 'vendor_assignment_id'> }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Replace placeholder in assignment
      const finalAssignment = {
        ...assignment,
        requested_by: user.id
      }

      // 1. Insert assignment
      const { data, error: assignmentError } = await (supabase.from('vendor_assignments') as any)
        .insert(finalAssignment)
        .select()
        .single()

      if (assignmentError) throw assignmentError
      
      const assignmentData = data as any

      // 2. If approval needed, insert approval
      if (approval && assignmentData) {
        let approverId = user.id // Fallback
        
        // Fetch appropriate approver based on level
        const targetRole = approval.approval_level === 'finance' ? 'finance_manager' : 'managing_director'
        const { data: approvers } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('role', targetRole)
          .limit(1)
          
        const approversData = approvers as any[]
        if (approversData && approversData.length > 0) {
          approverId = approversData[0].id
        }

        const { error: approvalError } = await (supabase.from('approval_requests') as any)
          .insert({
            ...approval,
            approver_id: approverId,
            vendor_assignment_id: assignmentData.id,
            status: 'pending'
          })
          
        if (approvalError) throw approvalError
      }

      return assignmentData as VendorAssignmentRow
    },
    onSuccess: () => {
      // Invalidate relevant queries (need to know program_id ideally, but we can invalidate all service categories for simplicity, or we should pass programId)
      queryClient.invalidateQueries({ queryKey: ['service_categories'] })
    },
  })
}
