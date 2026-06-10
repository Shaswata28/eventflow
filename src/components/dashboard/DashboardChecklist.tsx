"use client"

import { useAllPendingTasks, useUpdateTask } from '@/lib/hooks/useChecklist'
import { CheckCircle2, Circle, AlertCircle, Clock, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { format, isPast, isToday } from 'date-fns'

export function DashboardChecklist() {
  const { data: tasks, isLoading, isError } = useAllPendingTasks()
  const { mutate: updateTask } = useUpdateTask()
  const [optimisticDone, setOptimisticDone] = useState<Record<string, boolean>>({})

  if (isLoading) {
    return (
      <section className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex-1 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col h-[500px] overflow-hidden">
        <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Pending Tasks
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-red-500 dark:text-red-400">
          <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
          <p className="font-medium">Failed to load tasks</p>
          <p className="text-sm mt-1 opacity-70">There was an error communicating with the server.</p>
        </div>
      </section>
    )
  }

  const handleToggleTask = (task: any) => {
    // Optimistic UI update locally
    setOptimisticDone(prev => ({ ...prev, [task.id]: true }))
    
      updateTask(
      { 
        id: task.id, 
        updates: { is_done: true }, 
        programId: task.program_id 
      },
      {
        onSuccess: () => {
          toast.success(`Task completed: ${task.task_title}`)
        },
        onError: () => {
          // Revert optimistic update
          setOptimisticDone(prev => {
            const next = { ...prev }
            delete next[task.id]
            return next
          })
          toast.error('Failed to update task')
        }
      }
    )
  }

  const displayTasks = (tasks || [])
    .filter(t => !optimisticDone[t.id])

  // Group by program
  const groupedTasks = displayTasks.reduce((acc, task) => {
    if (!acc[task.program_id]) {
      acc[task.program_id] = {
        program: task.program,
        tasks: []
      }
    }
    acc[task.program_id].tasks.push(task)
    return acc
  }, {} as Record<string, { program: any, tasks: any[] }>)

  const sortedGroups = Object.values(groupedTasks).sort((a: any, b: any) => {
    // Sort by event date if available
    const dateA = a.program?.event_date ? new Date(a.program.event_date).getTime() : 0
    const dateB = b.program?.event_date ? new Date(b.program.event_date).getTime() : 0
    return dateA - dateB
  })

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col h-[500px] overflow-hidden group">
      <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-indigo-500" /> Pending Tasks
        </h3>
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-full">
          {displayTasks.length} left
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {displayTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">All caught up!</p>
            <p className="text-sm mt-1">No pending tasks for active events.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedGroups.map((group: any, groupIndex: number) => {
              const programName = group.program?.program_name === 'custom' 
                ? group.program.custom_name 
                : group.program?.program_name
                
              return (
                <div 
                  key={group.program?.id || groupIndex} 
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${groupIndex * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: group.program?.color || '#6366f1' }}
                    />
                    <Link 
                      href={`/dashboard/clients/${group.program?.client_id}/programs/${group.program?.id}`}
                      className="text-sm font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline capitalize"
                    >
                      {programName} • {group.program?.client?.full_name?.split(' ')[0] || 'Client'}
                    </Link>
                  </div>
                  
                  <ul className="space-y-1.5 border-l-2 border-gray-100 dark:border-gray-800 ml-1 pl-3">
                    {group.tasks.map((task: any) => {
                      const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))
                      
                      return (
                        <li 
                          key={task.id} 
                          className="group/item flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <button 
                            onClick={() => handleToggleTask(task)}
                            className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                          >
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800" />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">
                              {task.task_title}
                            </p>
                            
                            {(task.due_date || task.priority === 'high') && (
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {task.due_date && (
                                  <span className={`inline-flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                                    {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {format(new Date(task.due_date), 'MMM d')}
                                  </span>
                                )}
                                
                                {task.priority === 'high' && (
                                  <>
                                    {task.due_date && <span className="text-gray-300 dark:text-gray-700">•</span>}
                                    <span className="text-red-600 dark:text-red-400 font-bold uppercase tracking-wider text-[10px]">High</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
