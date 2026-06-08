import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type ProgramInsert = Database['public']['Tables']['event_programs']['Insert']
type ProgramUpdate = Database['public']['Tables']['event_programs']['Update']

export function usePrograms(clientId?: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: clientId ? ['programs', 'client', clientId] : ['programs', 'all'],
    queryFn: async () => {
      let query = (supabase as any)
        .from('event_programs')
        .select(`
          *,
          client:clients(full_name, client_code),
          partner:user_profiles!event_programs_responsible_partner_fkey(name)
        `)
        .order('event_date', { ascending: true })

      if (clientId) {
        query = query.eq('client_id', clientId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as any[]
    },
  })
}

export function useProgram(programId: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['program', programId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('event_programs')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('id', programId)
        .single()

      if (error) throw error
      return data as any
    },
    enabled: !!programId,
  })
}

export function useCreateProgram() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (newProgram: ProgramInsert) => {
      const { data: program, error: programError } = await (supabase as any)
        .from('event_programs')
        .insert(newProgram as any)
        .select()
        .single()

      if (programError) throw programError

      const { data: client, error: clientFetchError } = await (supabase as any)
        .from('clients')
        .select('status')
        .eq('id', newProgram.client_id)
        .single()

      if (!clientFetchError && client) {
        if (client.status === 'lead' || client.status === 'consultation') {
          await (supabase as any)
            .from('clients')
            .update({ status: 'confirmed' })
            .eq('id', newProgram.client_id)
        }
      }

      return program
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      if (data?.client_id) {
        queryClient.invalidateQueries({ queryKey: ['client', data.client_id] })
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      }
    },
  })
}

export function useUpdateProgram() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...update }: ProgramUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('event_programs')
        .update(update as any)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['programs'] })
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['program', data.id] })
      }
    },
  })
}
