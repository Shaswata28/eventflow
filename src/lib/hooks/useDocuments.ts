import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type DocumentInsert = Database['public']['Tables']['documents']['Insert']

export function useDocuments(parentId: string, parentType: 'program_id' | 'vendor_assignment_id' | 'client_id') {
  const supabase = createClient()
  
  return useQuery({
    queryKey: ['documents', parentType, parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*, uploaded_by_user:user_profiles!documents_uploaded_by_fkey(name)')
        .eq(parentType, parentId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!parentId
  })
}

interface UploadArgs {
  files: File[]
  bucket: 'bills' | 'contracts' | 'references'
  label: Database['public']['Enums']['document_label']
  parentId: string
  parentType: 'program_id' | 'vendor_assignment_id' | 'client_id'
}

export function useUploadDocuments() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ files, bucket, label, parentId, parentType }: UploadArgs) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) throw new Error('Not authenticated')

      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${parentId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        
        // 1. Upload to storage
        const { error: uploadError, data } = await supabase.storage
          .from(bucket)
          .upload(fileName, file)
          
        if (uploadError) throw uploadError

        // Get public URL or signed URL (using public URL for simplicity if bucket is private we'd need signed URLs to view, 
        // but let's store the path to generate signed URLs later)
        const fileUrl = `${bucket}/${fileName}`

        // 2. Insert into documents table
        const documentRecord: DocumentInsert = {
          file_name: file.name,
          file_url: fileUrl,
          file_type: file.type,
          file_size_bytes: file.size,
          label,
          uploaded_by: session.user.id,
          [parentType]: parentId
        }

        const { error: dbError } = await supabase
          .from('documents')
          .insert(documentRecord as any)

        if (dbError) throw dbError
      })

      await Promise.all(uploadPromises)
      
      return { success: true }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.parentType, variables.parentId] })
    }
  })
}

export function useDownloadDocument() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async (fileUrl: string) => {
      // fileUrl format: 'bucketName/fileName'
      const [bucket, ...pathParts] = fileUrl.split('/')
      const path = pathParts.join('/')
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 3600) // 1 hour expiry
        
      if (error) throw error
      
      return data.signedUrl
    }
  })
}
