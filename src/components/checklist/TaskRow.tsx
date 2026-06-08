import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Clock, MessageSquare, Flag, User as UserIcon, Trash2 } from 'lucide-react'
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
      case 'high': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
      default: return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
    }
  }

  return (
    <div 
      className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border-b border-border last:border-0 hover:bg-surface transition-colors ${task.is_done ? 'opacity-70' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <Checkbox 
          checked={task.is_done}
          onCheckedChange={handleToggle}
          className="mt-1 w-6 h-6 sm:w-5 sm:h-5 rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium ${task.is_done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.task_title}
            </span>
            <Badge variant="outline" className={`text-xs px-2 py-0 h-5 ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {task.assigned_user && (
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                {task.assigned_user.name}
              </div>
            )}
            
            {task.due_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {task.due_time}
              </div>
            )}
            
            {task.is_done && task.done_user && (
              <div className="text-green-600 dark:text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                Done by {task.done_user.name} 
                {task.done_at && ` (${formatDistanceToNow(new Date(task.done_at), { addSuffix: true })})`}
              </div>
            )}
          </div>
          
          {/* Note Display/Edit */}
          {(task.flag_note || isAddingNote) && (
            <div className="mt-2 flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
              {isAddingNote ? (
                <div className="flex gap-2 w-full max-w-sm">
                  <Input 
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add a note..."
                    className="h-7 text-xs bg-amber-50/50"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSaveNote()}
                  />
                  <Button size="sm" className="h-7 text-xs" onClick={handleSaveNote}>Save</Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setIsAddingNote(false); setNote(task.flag_note || ''); }}>Cancel</Button>
                </div>
              ) : (
                <p className="text-sm text-amber-700 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                  {task.flag_note}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className={`mt-3 sm:mt-0 flex gap-1 justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity ${isHovered ? 'opacity-100' : ''}`}>
        {!isAddingNote && (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-500" onClick={() => setIsAddingNote(true)} title="Add/Edit Note">
            <Flag className="w-4 h-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={handleDelete} title="Delete Task">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
