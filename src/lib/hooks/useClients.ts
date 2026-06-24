import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { logActivity } from '@/lib/utils/logActivity'

type ClientInsert = Database['public']['Tables']['clients']['Insert']
type ClientUpdate = Database['public']['Tables']['clients']['Update']

export function useClients() {
  const supabase = createClient()

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('clients')
        .select(`
          *,
          assigned_user:user_profiles!clients_assigned_to_fkey(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (Database['public']['Tables']['clients']['Row'] & { assigned_user: { name: string } | null })[]
    },
  })
}

export function useClient(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Database['public']['Tables']['clients']['Row']
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (newClient: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(newClient as any)
        .select()
        .single()

      if (error) throw error
      
      const createdClient = data as Database['public']['Tables']['clients']['Row']
      
      // Log activity
      await logActivity(supabase, {
        entityType: 'client',
        entityId: createdClient.id,
        action: 'create',
        description: `created a new event for ${createdClient.full_name}`,
        metadata: { 
          client_name: createdClient.full_name,
          event_type: createdClient.event_type,
          client_code: createdClient.client_code
        }
      })

      return createdClient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ id, ...update }: ClientUpdate & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('clients')
        .update(update)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Database['public']['Tables']['clients']['Row']
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['client', data.id] })
      }
    },
  })
}
