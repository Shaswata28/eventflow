import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type ClientInsert = Database['public']['Tables']['clients']['Insert']

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
      return data as Database['public']['Tables']['clients']['Row']
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
