"use client"

import { useActivityLog } from '@/lib/hooks/useActivityLog'
import { formatDistanceToNow } from 'date-fns'
import { Activity, Plus, Check, FileText, X, Edit, UserPlus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function ActivityFeed() {
  const { data: logs, isLoading } = useActivityLog()

  const getIconData = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert': return { icon: <Plus className="w-4 h-4" />, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' }
      case 'approve':
      case 'complete':
      case 'confirm': return { icon: <Check className="w-4 h-4" />, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10', border: 'border-indigo-100 dark:border-indigo-500/20' }
      case 'assign': return { icon: <UserPlus className="w-4 h-4" />, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20' }
      case 'reject': return { icon: <X className="w-4 h-4" />, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-100 dark:border-rose-500/20' }
      case 'upload': return { icon: <FileText className="w-4 h-4" />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' }
      case 'update': return { icon: <Edit className="w-4 h-4" />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20' }
      default: return { icon: <Activity className="w-4 h-4" />, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' }
    }
  }

  return (
    <section className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl shadow-sm flex flex-col h-[500px] overflow-hidden group">
      <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" /> Recent Activity
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">
        {isLoading ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="space-y-2 flex-1 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium text-gray-900 dark:text-white">No recent activity</p>
            <p className="text-sm mt-1">Things are quiet right now.</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {logs.map((log, index) => {
              const { icon, color, bg, border } = getIconData(log.action)
              return (
                <li 
                  key={log.id} 
                  className="relative pl-10 before:content-[''] before:absolute before:left-[15px] before:top-8 before:bottom-[-24px] before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-gray-100 dark:before:from-gray-700 dark:before:to-gray-800 last:before:hidden animate-in fade-in slide-in-from-bottom-2 group/item"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                  <div className={`absolute left-0 top-0.5 w-[32px] h-[32px] rounded-full flex items-center justify-center z-10 border shadow-sm ${bg} ${border} ${color} group-hover/item:scale-110 transition-transform duration-300`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white font-medium group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">
                      {log.description}
                    </p>
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {(log.metadata as any).client_name && (
                          <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-800/50 dark:text-gray-300 dark:ring-gray-700/50">
                            {(log.metadata as any).client_name}
                          </span>
                        )}
                        {(log.metadata as any).program_name && (
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-400 dark:ring-indigo-500/20">
                            {(log.metadata as any).program_name}
                          </span>
                        )}
                        {(log.metadata as any).category && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                            {(log.metadata as any).category}
                          </span>
                        )}
                        {(log.metadata as any).quoted_price !== undefined && (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                            ৳{Number((log.metadata as any).quoted_price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{log.actor?.name || 'System'}</p>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <p className="text-[11px] font-mono font-medium text-gray-400 dark:text-gray-500">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
