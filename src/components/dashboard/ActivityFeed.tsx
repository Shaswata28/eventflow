"use client"

import { useActivityLog } from '@/lib/hooks/useActivityLog'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Plus, Check, FileText, Settings, X, Edit } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ActivityFeed() {
  const { data: logs, isLoading } = useActivityLog()

  const getIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert': return <Plus className="w-4 h-4 text-emerald-500" />
      case 'approve':
      case 'confirm': return <Check className="w-4 h-4 text-blue-500" />
      case 'reject': return <X className="w-4 h-4 text-red-500" />
      case 'upload': return <FileText className="w-4 h-4 text-indigo-500" />
      case 'update': return <Edit className="w-4 h-4 text-amber-500" />
      default: return <Activity className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <Card className="h-full bg-surface border-border shadow-none rounded-[12px] flex flex-col">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-muted shrink-0 border border-border"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No recent activity.
          </div>
        ) : (
          <ScrollArea className="h-[400px] sm:h-[500px]">
            <div className="p-6 relative">
              <div className="absolute left-10 top-6 bottom-6 w-px bg-border"></div>
              <div className="space-y-6 relative">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center z-10 shadow-sm">
                      {getIcon(log.action)}
                    </div>
                    <div className="flex-1 pb-1 pt-1.5">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{log.actor?.name || 'System'}</span>{' '}
                        <span className="text-muted-foreground">{log.description}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
