import { useState, useMemo } from 'react'
import { Plus, ListTodo, MoreVertical, CheckCircle2 } from 'lucide-react'
import { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    return <div className="p-12 text-center animate-pulse text-gray-500 font-medium">Loading checklist operations...</div>
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* Premium Header & Stats */}
      <div className="sticky top-6 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-800 shadow-xl flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between transition-all">
        <div className="w-full sm:w-3/5 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-extrabold text-2xl flex items-center gap-3 text-gray-900 dark:text-white">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <ListTodo className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
                </div>
                Event Checklist
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Real-time sync across all devices</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
                {stats.percent}%
              </span>
            </div>
          </div>
          <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              style={{ width: `${stats.percent}%` }}
            />
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stats.done} of {stats.total} tasks completed</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
          {!tasks?.length && (
            <Button variant="outline" onClick={handleUseTemplate} disabled={isCreating} className="rounded-xl font-semibold border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              Use Template
            </Button>
          )}
          <Button onClick={() => setIsAdding(true)} className="w-full sm:w-auto rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* Add Task Form Inline */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="bg-indigo-50/80 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex flex-col md:flex-row gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
          <div className="flex-1 space-y-1">
            <Input 
              placeholder="Task title (e.g. Test microphone)" 
              value={newTask.task_title || ''}
              onChange={e => setNewTask({ ...newTask, task_title: e.target.value })}
              autoFocus
              className="bg-white dark:bg-gray-900 rounded-xl h-12 text-base shadow-sm border-gray-200 dark:border-gray-800"
            />
          </div>
          <div className="w-full md:w-48 space-y-1">
            <Select value={newTask.department || 'General'} onValueChange={(val) => setNewTask({ ...newTask, department: val || 'General' })}>
              <SelectTrigger className="bg-white dark:bg-gray-900 rounded-xl h-12 shadow-sm border-gray-200 dark:border-gray-800"><SelectValue placeholder="Dept" /></SelectTrigger>
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
          <div className="w-full md:w-40 space-y-1">
            <Select value={newTask.priority || 'normal'} onValueChange={(val) => setNewTask({ ...newTask, priority: val as any })}>
              <SelectTrigger className="bg-white dark:bg-gray-900 rounded-xl h-12 shadow-sm border-gray-200 dark:border-gray-800"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isCreating || !newTask.task_title?.trim()} className="rounded-xl h-12 px-6 shadow-sm bg-indigo-600 hover:bg-indigo-700">Save</Button>
            <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-12">Cancel</Button>
          </div>
        </form>
      )}

      {/* Tasks Grouped by Department */}
      {!tasks?.length && !isAdding ? (
        <div className="text-center py-20 border border-dashed rounded-3xl bg-gray-50/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 mt-8">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">All clear</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto font-medium">Build your checklist to keep track of event day operations. Use a template to get started quickly.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(tasksByDept).map(([dept, deptTasks], index) => (
            <div 
              key={dept} 
              className="rounded-3xl border border-gray-200/60 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <div className="bg-gray-50/80 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-100 dark:border-gray-800 font-medium flex justify-between items-center backdrop-blur-sm">
                <span className="uppercase text-sm tracking-widest font-bold text-gray-700 dark:text-gray-300">{dept}</span>
                <span className="text-sm font-semibold bg-white dark:bg-gray-900 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-800">
                  {deptTasks.filter((t: any) => t.is_done).length} / {deptTasks.length} Done
                </span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
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
