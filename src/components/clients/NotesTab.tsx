'use client'

import { useState, useEffect } from 'react'
import { useNotes, useCreateNote, useUpdateNote } from '@/lib/hooks/useNotes'
import { ConsultationEditor } from '@/components/clients/ConsultationEditor'
import { Plus, Edit2, FileText, CheckCircle2 } from 'lucide-react'
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
    
    // Auto-close editor after brief delay to show success state (optional, but good UX)
    setTimeout(() => {
      closeEditor()
    }, 500)
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
    return <div className="animate-pulse space-y-4 py-12 text-center text-gray-500 font-medium">Loading consultation notes...</div>
  }

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> Consultation Notes
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Keep track of client meetings, requirements, and decisions.</p>
        </div>
        {!isEditorOpen && (
          <button
            onClick={() => setIsEditorOpen(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Note
          </button>
        )}
      </div>

      {isEditorOpen && (
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/50 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-indigo-500" />
              {activeDraftId ? 'Edit Consultation Note' : 'New Consultation Note'}
            </h4>
          </div>
          
          <div className="rounded-2xl border border-transparent">
            <ConsultationEditor 
              key={activeDraftId || 'new'} 
              initialContent={activeDraftId ? notes?.find(n => n.id === activeDraftId)?.content || '' : ''}
              onSave={handleSaveNote} 
              onCancel={closeEditor} 
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {notes?.length === 0 ? (
          <div className="text-center py-16 bg-white/50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No consultation notes yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Jot down important details from your meetings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {notes?.filter(note => note.id !== activeDraftId).map((note, index) => (
              <div 
                key={note.id} 
                className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl border border-gray-200/50 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
              >
                
                {/* Header */}
                <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 shadow-sm border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-extrabold text-xl">
                      {/* @ts-ignore */}
                      {note.author?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      {/* @ts-ignore */}
                      <p className="text-base font-bold text-gray-900 dark:text-white">{note.author?.name || 'Unknown'}</p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{formatDateTime(note.created_at)}</p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleEditClick(note.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-900 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 border border-gray-200 dark:border-gray-700"
                    title="Edit Note"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                </div>
                
                {/* Content */}
                <div className="px-6 py-6 sm:px-8 sm:py-8 bg-white dark:bg-gray-900">
                  <div 
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 font-medium leading-relaxed tiptap-content prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
