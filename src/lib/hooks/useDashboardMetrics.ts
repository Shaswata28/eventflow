import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type UserRole = Database['public']['Enums']['user_role']

export interface DashboardMetrics {
  activePrograms: number
  totalClients: number
  pendingApprovals: number
  vendorsConfirmed: number
}

export function useDashboardMetrics(role?: UserRole) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['dashboard-metrics', role],
    queryFn: async () => {
      // Use concurrent queries for performance
      const [
        { count: activePrograms },
        { count: totalClients },
        { count: pendingApprovals },
        { count: vendorsConfirmed }
      ] = await Promise.all([
        supabase
          .from('event_programs')
          .select('*', { count: 'exact', head: true })
          .neq('status', 'completed')
          .neq('status', 'cancelled'),
        
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true }),
        
        supabase
          .from('approval_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),

        supabase
          .from('vendor_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'confirmed')
      ])

      return {
        activePrograms: activePrograms || 0,
        totalClients: totalClients || 0,
        pendingApprovals: pendingApprovals || 0,
        vendorsConfirmed: vendorsConfirmed || 0
      } as DashboardMetrics
    },
    refetchInterval: 60000 // auto-refresh every 60 seconds
  })
}
