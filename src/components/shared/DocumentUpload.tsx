"use client"

import { useState, useCallback } from 'react'
import { UploadCloud, File, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadDocuments } from '@/lib/hooks/useDocuments'
import { Database } from '@/types/database.types'

interface DocumentUploadProps {
  parentId: string
  parentType: 'program_id' | 'vendor_assignment_id' | 'client_id'
  bucket: 'bills' | 'contracts' | 'references'
  label: Database['public']['Enums']['document_label']
  onSuccess?: () => void
}

export function DocumentUpload({ parentId, parentType, bucket, label, onSuccess }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  
  const { mutateAsync: uploadDocuments, isPending } = useUploadDocuments()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(validateFile)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(validateFile)
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateFile = (file: File) => {
    // Check type: PDF or images
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert(`File type not supported: ${file.name}`)
      return false
    }
    // Check size: max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert(`File too large (max 10MB): ${file.name}`)
      return false
    }
    return true
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    try {
      await uploadDocuments({
        files: selectedFiles,
        bucket,
        label,
        parentId,
        parentType
      })
      setSelectedFiles([])
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload documents. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <div 
        className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors
          ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          PDF, PNG, JPG up to 10MB (Multiple allowed)
        </p>
        <input 
          type="file" 
          multiple 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleChange}
          disabled={isPending}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Files ({selectedFiles.length})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {selectedFiles.map((file, i) => (
              <div key={`${file.name}-${i}`} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center truncate">
                  <File className="w-4 h-4 text-indigo-500 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate text-gray-700 dark:text-gray-300">{file.name}</span>
                </div>
                <button 
                  onClick={() => removeFile(i)} 
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  disabled={isPending}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={handleUpload}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Files'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
