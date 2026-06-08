'use client'

import { useState, useEffect } from 'react'
import { useNotes, useCreateNote, useUpdateNote } from '@/lib/hooks/useNotes'
import { ConsultationEditor } from '@/components/clients/ConsultationEditor'
import { Plus, Edit2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/formatters'
import { createClient } from '@/lib/supabase/client'

export function NotesTab({ clientId }: { clientId: string }) {
  const { data: notes, isLoading } = useNotes(clientId)
  const { mutateAsync: createNote } = useCreateNote()
  const { mutateAsync: updateNote } = useUpdateNote()
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  const handleSaveNote = async (content: string) => {
    if (!currentUserId) return
    
    if (activeDraftId) {
      await updateNote({ id: activeDraftId, content })
    } else {
      const newNote = await createNote({
        client_id: clientId,
        content,
        author_id: currentUserId,
        content_type: 'html'
      })
      setActiveDraftId(newNote.id)
    }
  }

  const closeEditor = () => {
    setIsEditorOpen(false)
    setActiveDraftId(null)
  }

  const handleEditClick = (noteId: string) => {
    setActiveDraftId(noteId)
    setIsEditorOpen(true)
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4 py-4 text-center text-gray-500">Loading notes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Consultation Notes</h3>
        {!isEditorOpen && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Note
          </button>
        )}
      </div>

      {isEditorOpen && (
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 mb-6 border border-indigo-100 dark:border-indigo-900">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
            {activeDraftId ? 'Edit Consultation Note' : 'New Consultation Note'}
          </h4>
          <ConsultationEditor 
            key={activeDraftId || 'new'} 
            initialContent={activeDraftId ? notes?.find(n => n.id === activeDraftId)?.content || '' : ''}
            onSave={handleSaveNote} 
            onCancel={closeEditor} 
          />
        </div>
      )}

      <div className="space-y-4">
        {notes?.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">No consultation notes yet.</p>
          </div>
        ) : (
          notes?.filter(note => note.id !== activeDraftId).map((note) => (
            <div key={note.id} className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium">
                    {/* @ts-ignore */}
                    {note.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    {/* @ts-ignore */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{note.author?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(note.created_at)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEditClick(note.id)}
                  className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                  title="Edit Note"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div 
                className="px-4 py-5 sm:p-6 prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 tiptap-content"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
