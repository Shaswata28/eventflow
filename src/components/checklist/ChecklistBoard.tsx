import { useState, useMemo } from 'react'
import { Plus, ListTodo, MoreVertical, CheckCircle2 } from 'lucide-react'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskRow } from './TaskRow'
import { useChecklist, useChecklistSubscription, useCreateTask } from '@/lib/hooks/useChecklist'
import { getTemplateForProgram } from '@/lib/utils/checklistTemplates'
import { useProgram } from '@/lib/hooks/usePrograms'

export function ChecklistBoard({ programId }: { programId: string }) {
  // Realtime subscription
  useChecklistSubscription(programId)
  
  const { data: program } = useProgram(programId)
  const { data: tasks, isLoading } = useChecklist(programId)
  const { mutateAsync: createTask, isPending: isCreating } = useCreateTask()
  
  const [isAdding, setIsAdding] = useState(false)
  const [newTask, setNewTask] = useState<Omit<Database['public']['Tables']['event_checklists']['Insert'], 'created_at' | 'created_by'>>({
    program_id: programId,
    task_title: '',
    department: 'General',
    priority: 'normal',
    is_done: false
  })

  // Derived state
  const tasksByDept = useMemo(() => {
    if (!tasks) return {}
    const grouped: Record<string, any[]> = {}
    tasks.forEach(task => {
      if (!grouped[task.department]) grouped[task.department] = []
      grouped[task.department].push(task)
    })
    return grouped
  }, [tasks])

  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) return { total: 0, done: 0, percent: 0 }
    const done = tasks.filter(t => t.is_done).length
    return {
      total: tasks.length,
      done,
      percent: Math.round((done / tasks.length) * 100)
    }
  }, [tasks])

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.task_title?.trim()) return
    
    await createTask(newTask)
    
    setNewTask({
      program_id: programId,
      task_title: '',
      department: 'General',
      priority: 'normal',
      is_done: false
    })
    setIsAdding(false)
  }

  const handleUseTemplate = async () => {
    if (!program) return
    const templateTasks = getTemplateForProgram(program.program_name)
    
    // Create all tasks sequentially or in parallel
    for (const task of templateTasks) {
      await createTask({
        program_id: programId,
        task_title: task.task_title,
        department: task.department,
        priority: task.priority,
        is_done: false
      })
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center animate-pulse text-gray-500">Loading checklist...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="sticky top-0 z-10 bg-surface rounded-[12px] p-6 border border-border shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="w-full sm:w-1/2 space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
                <ListTodo className="w-5 h-5 text-primary" />
                Event Checklist
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Real-time sync across all devices</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">{stats.percent}%</span>
            </div>
          </div>
          <Progress value={stats.percent} className="h-2 bg-muted [&>div]:bg-primary" />
          <p className="text-sm text-muted-foreground">{stats.done} of {stats.total} tasks completed</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {!tasks?.length && (
            <Button variant="outline" onClick={handleUseTemplate} disabled={isCreating}>
              Use Template
            </Button>
          )}
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Add Task Form Inline */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 flex flex-col md:flex-row gap-3">
          <div className="flex-1 space-y-1">
            <Input 
              placeholder="Task title (e.g. Test microphone)" 
              value={newTask.task_title || ''}
              onChange={e => setNewTask({ ...newTask, task_title: e.target.value })}
              autoFocus
              className="bg-white dark:bg-gray-800"
            />
          </div>
          <div className="w-full md:w-40 space-y-1">
            <Select value={newTask.department || 'General'} onValueChange={(val) => setNewTask({ ...newTask, department: val || 'General' })}>
              <SelectTrigger className="bg-white dark:bg-gray-800"><SelectValue placeholder="Dept" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Venue">Venue</SelectItem>
                <SelectItem value="Decor">Decor</SelectItem>
                <SelectItem value="Catering">Catering</SelectItem>
                <SelectItem value="Logistics">Logistics</SelectItem>
                <SelectItem value="Photography">Photography</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-32 space-y-1">
            <Select value={newTask.priority || 'normal'} onValueChange={(val) => setNewTask({ ...newTask, priority: val as any })}>
              <SelectTrigger className="bg-white dark:bg-gray-800"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isCreating || !newTask.task_title?.trim()}>Save</Button>
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Tasks Grouped by Department */}
      {!tasks?.length && !isAdding ? (
        <div className="text-center py-12 border border-dashed rounded-[12px] bg-surface border-border">
          <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground">All clear</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">Build your checklist to keep track of event day operations. Use a template to get started quickly.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByDept).map(([dept, deptTasks]) => (
            <div key={dept} className="rounded-[12px] border border-border bg-white overflow-hidden shadow-sm">
              <div className="bg-surface px-4 py-3 border-b border-border font-medium text-foreground flex justify-between items-center">
                <span className="uppercase text-xs tracking-wider font-semibold">{dept}</span>
                <span className="text-xs text-muted-foreground">
                  {deptTasks.filter((t: any) => t.is_done).length} / {deptTasks.length}
                </span>
              </div>
              <div className="divide-y divide-border">
                {deptTasks.map((task: any) => (
                  <TaskRow key={task.id} task={task} programId={programId} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
