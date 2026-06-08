import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type NoteInsert = Database['public']['Tables']['consultation_notes']['Insert']

export function useNotes(clientId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['notes', clientId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('consultation_notes')
        .select(`
          *,
          author:user_profiles!consultation_notes_author_id_fkey(name, avatar_url)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Database['public']['Tables']['consultation_notes']['Row'] & { author: { name: string; avatar_url: string | null } | null })[]
    },
    enabled: !!clientId,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (newNote: NoteInsert) => {
      const { data, error } = await supabase
        .from('consultation_notes')
        .insert(newNote as any)
        .select()
        .single()

      if (error) throw error
      return data as Database['public']['Tables']['consultation_notes']['Row']
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.client_id] })
    },
  })
}

type NoteUpdate = Database['public']['Tables']['consultation_notes']['Update']

export function useUpdateNote() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...update }: NoteUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('consultation_notes')
        .update(update as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Database['public']['Tables']['consultation_notes']['Row']
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notes', data.client_id] })
    },
  })
}
