import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type VendorRow = Database['public']['Tables']['vendors']['Row']
type VendorInsert = Database['public']['Tables']['vendors']['Insert']
type VendorCategory = Database['public']['Enums']['vendor_category']

export function useVendors(categoryFilter?: VendorCategory | 'all') {
  const supabase = createClient()

  return useQuery({
    queryKey: ['vendors', categoryFilter],
    queryFn: async () => {
      let query = supabase.from('vendors').select('*').order('name', { ascending: true })

      if (categoryFilter && categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) throw error
      return data as VendorRow[]
    },
  })
}

export function useVendor(id: string) {
  const supabase = createClient()

  return useQuery({
    queryKey: ['vendor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as VendorRow
    },
    enabled: !!id,
  })
}

export function useCreateVendor() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (newVendor: VendorInsert) => {
      const { data, error } = await supabase
        .from('vendors')
        .insert(newVendor as any)
        .select()
        .single()

      if (error) throw error
      return data as VendorRow
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
    },
  })
}
