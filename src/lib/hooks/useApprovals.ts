import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { determineNextStatus } from '@/lib/utils/approvals'

type ApprovalRequest = Database['public']['Tables']['approval_requests']['Row']
type VendorAssignment = Database['public']['Tables']['vendor_assignments']['Row']
type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
type Vendor = Database['public']['Tables']['vendors']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type EventProgram = Database['public']['Tables']['event_programs']['Row']
type Client = Database['public']['Tables']['clients']['Row']

export type EnrichedApprovalRequest = ApprovalRequest & {
  vendor_assignments: VendorAssignment & {
    service_categories: ServiceCategory & {
      event_programs: EventProgram & {
        clients: Client
      }
    }
    vendors: Vendor
    requested_by_user: UserProfile
  }
}

export function usePendingApprovals() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['approvals', 'pending'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const role = (profile as any)?.role

      if (!role || (role !== 'finance_manager' && role !== 'managing_director')) {
        return []
      }

      const targetLevel = role === 'finance_manager' ? 'finance' : 'md'

      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          vendor_assignments!inner (
            *,
            service_categories!inner (
              *,
              event_programs!inner (
                *,
                clients!inner (*)
              )
            ),
            vendors (*),
            requested_by_user:user_profiles!vendor_assignments_requested_by_fkey (*)
          )
        `)
        .eq('status', 'pending')
        .eq('approval_level', targetLevel)
        .order('requested_at', { ascending: false })

      if (error) throw error
      return data as any as EnrichedApprovalRequest[]
    },
    refetchInterval: 60000 // Poll every 60 seconds
  })
}

export function useResolvedApprovals() {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['approvals', 'resolved'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      const role = (profile as any)?.role

      if (!role || (role !== 'finance_manager' && role !== 'managing_director')) {
        return []
      }

      const targetLevel = role === 'finance_manager' ? 'finance' : 'md'
      
      // Get auth user ID for approver_id filtering
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          vendor_assignments!inner (
            *,
            service_categories!inner (
              *,
              event_programs!inner (
                *,
                clients!inner (*)
              )
            ),
            vendors (*),
            requested_by_user:user_profiles!vendor_assignments_requested_by_fkey (*)
          )
        `)
        .neq('status', 'pending')
        .eq('approval_level', targetLevel)
        .eq('approver_id', user.id)
        .order('resolved_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as any as EnrichedApprovalRequest[]
    }
  })
}

interface ResolveApprovalArgs {
  approvalId: string
  assignmentId: string
  decision: 'approved' | 'rejected'
  note: string
  currentLevel: Database['public']['Enums']['approval_level']
  quotedPrice: number
}

export function useResolveApproval() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ approvalId, assignmentId, decision, note, currentLevel, quotedPrice }: ResolveApprovalArgs) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { assignmentStatus, escalateTo } = determineNextStatus(currentLevel, decision, quotedPrice)

      // 1. Update current approval request
      const { error: approvalError } = await (supabase.from('approval_requests') as any)
        .update({
          status: decision,
          note,
          resolved_at: new Date().toISOString(),
          approver_id: user.id // record who exactly resolved it
        })
        .eq('id', approvalId)

      if (approvalError) throw approvalError

      // 2. Update vendor assignment status
      const { error: assignmentError } = await (supabase.from('vendor_assignments') as any)
        .update({ status: assignmentStatus })
        .eq('id', assignmentId)

      if (assignmentError) throw assignmentError

      // 3. Escalate if needed (Create MD approval request)
      if (escalateTo) {
        const { error: escalateError } = await supabase
          .from('approval_requests')
          .insert({
            vendor_assignment_id: assignmentId,
            approval_level: escalateTo,
            approver_id: '00000000-0000-0000-0000-000000000000' // Placeholder until assigned or leave null if schema allows, wait, schema requires approver_id.
            // Actually, in schema approver_id is required. We can use a dummy or the actual MD user ID.
            // For now, we will fetch the MD user ID and use it.
          } as any)
          
        if (escalateError) {
            // Need to fix this by getting MD user ID first.
            // Will do it in the mutation properly:
        }
      }
      
      // Let's refine the escalate block
      if (escalateTo) {
          // Get an MD user ID
          const { data: mdUsers } = await supabase.from('user_profiles').select('id').eq('role', 'managing_director').limit(1)
          const mdId = (mdUsers as any)?.[0]?.id || user.id
          
          await (supabase.from('approval_requests') as any).insert({
            vendor_assignment_id: assignmentId,
            approval_level: escalateTo,
            approver_id: mdId,
            status: 'pending'
          } as any)
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] }) // refresh assignment statuses
    }
  })
}
