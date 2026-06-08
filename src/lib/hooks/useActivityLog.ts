import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

export type EnrichedActivityLog = Database['public']['Tables']['activity_log']['Row'] & {
  actor?: { name: string, avatar_url: string | null } | null
}

export function useActivityLog() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['activity-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          actor:user_profiles!activity_log_actor_id_fkey(name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      return data as any as EnrichedActivityLog[]
    }
  })

  // Subscribe to real-time new activities
  useEffect(() => {
    const channel = supabase
      .channel(`public:activity_log:${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log'
        },
        () => {
          // Refetch to get the latest activities (which also gets the joined actor data)
          queryClient.invalidateQueries({ queryKey: ['activity-log'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])

  return query
}
