'use client'

import { useDocuments, useDownloadDocument } from '@/lib/hooks/useDocuments'
import { DocumentUpload } from '@/components/shared/DocumentUpload'
import { FileText, Download, File } from 'lucide-react'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'

interface DocumentsTabProps {
  parentId: string
  parentType: 'program_id' | 'vendor_assignment_id' | 'client_id'
}

export function DocumentsTab({ parentId, parentType }: DocumentsTabProps) {
  const { data: documents, isLoading } = useDocuments(parentId, parentType)
  const { mutateAsync: downloadDocument, isPending: isDownloading } = useDownloadDocument()

  const handleDownload = async (fileUrl: string) => {
    try {
      const signedUrl = await downloadDocument(fileUrl)
      window.open(signedUrl, '_blank')
    } catch (error) {
      console.error('Failed to download document:', error)
      alert('Failed to download document. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-gray-900 p-6 sm:p-8 border border-gray-200/60 dark:border-gray-800 rounded-3xl shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {[1, 2, 3].map((i) => (
              <li key={i} className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-gray-900 p-6 sm:p-8 border border-gray-200/60 dark:border-gray-800 rounded-3xl shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> Documents
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and manage documents related to this {parentType === 'client_id' ? 'client' : 'program'}.</p>
        </div>
        <DocumentUpload 
          parentId={parentId} 
          parentType={parentType} 
          bucket="references" 
          label="reference"
        />
      </div>

      {documents && documents.length > 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-500 delay-150 fill-mode-both">
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {(documents as any[]).map((doc: any, index: number) => (
              <li 
                key={doc.id} 
                className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50 + 200}ms`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800/30">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-gray-900 dark:text-white truncate">{doc.file_name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <span className="capitalize border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-[10px]">{doc.label}</span>
                      <span>{(doc.file_size_bytes / 1024).toFixed(1)} KB</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</span>
                      {doc.uploaded_by_user?.name && (
                        <>
                          <span className="hidden sm:inline">•</span>
                          <span>By {doc.uploaded_by_user.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(doc.file_url)}
                  disabled={isDownloading}
                  className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-full transition-colors disabled:opacity-50"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl animate-in fade-in duration-500 delay-150 fill-mode-both">
          <div className="mx-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full shadow-sm flex items-center justify-center mb-4">
            <File className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No documents</h3>
          <p className="text-sm">Upload a document to get started.</p>
        </div>
      )}
    </div>
  )
}
