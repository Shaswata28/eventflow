import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

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

      const { data, error } = await supabase
        .from('event_checklists')
        .insert({
          ...task,
          created_by: session.user.id
        } as any)
        .select()
        .single()

      if (error) throw error
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

      const { data, error } = await supabase
        .from('event_checklists')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
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
