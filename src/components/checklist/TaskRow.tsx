import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Clock, MessageSquare, Flag, User as UserIcon, Trash2, Check } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useChecklist'

interface TaskRowProps {
  task: any // Database['public']['Tables']['event_checklists']['Row'] & joined users
  programId: string
}

export function TaskRow({ task, programId }: TaskRowProps) {
  const { mutate: updateTask } = useUpdateTask()
  const { mutate: deleteTask } = useDeleteTask()
  const [isHovered, setIsHovered] = useState(false)
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [note, setNote] = useState(task.flag_note || '')

  const handleToggle = (checked: boolean) => {
    updateTask({ id: task.id, programId, updates: { is_done: checked } })
  }

  const handleSaveNote = () => {
    updateTask({ id: task.id, programId, updates: { flag_note: note } })
    setIsAddingNote(false)
  }

  const handleDelete = () => {
    if (window.confirm('Delete this task?')) {
      deleteTask({ id: task.id, programId })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-400 dark:border-rose-500/30'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
      default: return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-400 dark:border-indigo-500/30'
    }
  }

  return (
    <div 
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 bg-transparent transition-all duration-300 relative overflow-hidden
        ${task.is_done ? 'opacity-60 bg-gray-50/50 dark:bg-gray-900/50' : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Strikethrough Background Line */}
      <div 
        className={`absolute left-14 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-gray-300 dark:bg-gray-600 rounded-full transition-all duration-500 pointer-events-none origin-left
          ${task.is_done ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
        `} 
      />

      <div className="flex items-start gap-4 relative z-10">
        <Checkbox 
          checked={task.is_done}
          onCheckedChange={handleToggle}
          className="mt-1 w-6 h-6 rounded-full border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 transition-all duration-300
            data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500
            data-checked:bg-emerald-500 data-checked:border-emerald-500
          "
        />
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`font-semibold transition-colors duration-300 ${task.is_done ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
              {task.task_title}
            </span>
            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 h-auto font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
            {task.assigned_user && (
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                {task.assigned_user.name}
              </div>
            )}
            
            {task.due_time && (
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                {task.due_time}
              </div>
            )}
            
            {task.is_done && task.done_user && (
              <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <Check className="w-3.5 h-3.5" />
                Done by {task.done_user.name} 
                {task.done_at && ` (${formatDistanceToNow(new Date(task.done_at), { addSuffix: true })})`}
              </div>
            )}
          </div>
          
          {/* Note Display/Edit */}
          {(task.flag_note || isAddingNote) && (
            <div className="mt-3 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
              {isAddingNote ? (
                <div className="flex gap-2 w-full max-w-sm">
                  <Input 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a detail or note..."
                    className="h-8 text-sm bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500 rounded-lg"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
                  />
                  <Button size="sm" className="h-8 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-700" onClick={handleSaveNote}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs rounded-lg" onClick={() => { setIsAddingNote(false); setNote(task.flag_note || ''); }}>Cancel</Button>
                </div>
              ) : (
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 italic bg-indigo-50 dark:bg-indigo-500/10 px-3 py-2 rounded-xl border border-indigo-100/50 dark:border-indigo-500/20">
                  {task.flag_note}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={`mt-4 sm:mt-0 flex gap-2 justify-end transition-opacity duration-300 relative z-10 ${isHovered || isAddingNote ? 'opacity-100' : 'sm:opacity-0'}`}>
        {!isAddingNote && (
          <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:hover:border-indigo-800" onClick={() => setIsAddingNote(true)} title="Add/Edit Note">
            <Flag className="w-3.5 h-3.5" />
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-gray-200 dark:border-gray-700 text-gray-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/20 dark:hover:border-rose-800" onClick={handleDelete} title="Delete Task">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
