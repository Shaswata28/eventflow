import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { logActivity } from '@/lib/utils/logActivity'

type ChecklistItem = Database['public']['Tables']['event_checklists']['Row']
type ChecklistInsert = Database['public']['Tables']['event_checklists']['Insert']

export function useChecklist(programId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['checklists', programId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_checklists')
        .select(`
          *,
          assigned_user:user_profiles!event_checklists_assigned_to_fkey(name, avatar_url),
          done_user:user_profiles!event_checklists_done_by_fkey(name)
        `)
        .eq('program_id', programId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as (ChecklistItem & { 
        assigned_user?: { name: string, avatar_url: string | null } | null,
        done_user?: { name: string } | null
      })[]
    },
    enabled: !!programId
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (task: Omit<ChecklistInsert, 'created_by'>) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data: insertData, error } = await supabase
        .from('event_checklists')
        .insert({
          ...task,
          created_by: session.user.id
        } as any)
        .select()
        .single()

      if (error) throw error
      const data = insertData as any
      
      let assignedUserName = 'team'
      if (task.assigned_to) {
        const { data: userProfile } = await supabase.from('user_profiles').select('name').eq('id', task.assigned_to).single()
        if (userProfile) assignedUserName = (userProfile as any).name
      }
      
      await logActivity(supabase as any, {
        entityType: 'event_checklist',
        entityId: data.id,
        action: 'assign',
        description: `assigned task '${data.task_title}' to ${assignedUserName}`,
        metadata: {
          task_title: data.task_title,
          assigned_to_name: assignedUserName,
          program_id: data.program_id
        }
      })

      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', variables.program_id] })
    }
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, updates, programId }: { id: string, updates: Database['public']['Tables']['event_checklists']['Update'], programId: string }) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')
      
      // If marking as done, record who and when
      if (updates.is_done === true) {
        updates.done_by = session.user.id
        updates.done_at = new Date().toISOString()
      } else if (updates.is_done === false) {
        updates.done_by = null
        updates.done_at = null
      }

      const { data, error } = await (supabase as any)
        .from('event_checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      if (updates.is_done === true) {
        await logActivity(supabase as any, {
          entityType: 'event_checklist',
          entityId: data.id,
          action: 'complete',
          description: `marked '${data.task_title}' as done`,
          metadata: {
            task_title: data.task_title,
            program_id: data.program_id
          }
        })
      }

      return data
    },
    // Optimistic update
    onMutate: async ({ id, updates, programId }) => {
      await queryClient.cancelQueries({ queryKey: ['checklists', programId] })
      const previousTasks = queryClient.getQueryData(['checklists', programId])

      queryClient.setQueryData(['checklists', programId], (old: any) => {
        if (!old) return old
        return old.map((task: any) => 
          task.id === id ? { ...task, ...updates } : task
        )
      })

      return { previousTasks, programId }
    },
    onError: (err, newTodo, context: any) => {
      queryClient.setQueryData(['checklists', context.programId], context.previousTasks)
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', variables.programId] })
      queryClient.invalidateQueries({ queryKey: ['checklists', 'pending-all'] })
    }
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, programId }: { id: string, programId: string }) => {
      const { error } = await supabase
        .from('event_checklists')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklists', variables.programId] })
    }
  })
}

// Subscribe to real-time changes
export function useChecklistSubscription(programId: string) {
  const queryClient = useQueryClient()
  const supabase = createClient()

  useEffect(() => {
    if (!programId) return

    const channel = supabase
      .channel(`public:event_checklists:${programId}:${Math.random()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_checklists',
          filter: `program_id=eq.${programId}`
        },
        () => {
          // Whenever a change happens, invalidate the query to fetch fresh data
          queryClient.invalidateQueries({ queryKey: ['checklists', programId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [programId, queryClient, supabase])
}

// Fetch all pending tasks across all active programs for the dashboard
export function useAllPendingTasks() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['checklists', 'pending-all'],
    queryFn: async () => {
      // First, get all active programs
      const { data: activePrograms, error: programsError } = await supabase
        .from('event_programs')
        .select('id, program_name, custom_name, color, event_date, client:clients(full_name)')
        .in('status', ['planning', 'vendors_sourcing', 'vendors_confirmed', 'ready', 'live'])
        
      if (programsError) throw programsError

      if (!activePrograms || activePrograms.length === 0) {
        return []
      }

      const programIds = (activePrograms as any[]).map(p => p.id)

      // Fetch pending tasks for these programs
      const { data, error } = await supabase
        .from('event_checklists')
        .select(`
          *,
          assigned_user:user_profiles!event_checklists_assigned_to_fkey(name, avatar_url),
          done_user:user_profiles!event_checklists_done_by_fkey(name)
        `)
        .in('program_id', programIds)
        .eq('is_done', false)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Map program details onto tasks
      return (data as any[]).map(task => {
        const program = (activePrograms as any[]).find(p => p.id === task.program_id)
        return {
          ...task,
          program
        }
      })
    }
  })
}
