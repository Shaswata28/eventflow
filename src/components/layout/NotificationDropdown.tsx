"use client"

import { useState, useEffect } from 'react'
import { Bell, Activity, CheckCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useActivityLog } from '@/lib/hooks/useActivityLog'
import { usePendingApprovals } from '@/lib/hooks/useApprovals'

export function NotificationDropdown() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { data: activities, isLoading: isActivityLoading } = useActivityLog()
  const { data: pendingApprovals, isLoading: isApprovalsLoading } = usePendingApprovals()

  useEffect(() => {
    setMounted(true)
  }, [])

  const pendingCount = pendingApprovals?.length || 0
  const hasNotifications = mounted && pendingCount > 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative p-2 text-muted-foreground hover:text-foreground focus:outline-none rounded-full hover:bg-secondary transition-colors">
        <span className="sr-only">View notifications</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {hasNotifications && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 mr-4 mt-1 border-border bg-card shadow-lg rounded-xl overflow-hidden" align="end">
        <div className="bg-secondary px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        </div>
        
        <Tabs defaultValue="approvals" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2 bg-secondary">
              <TabsTrigger value="approvals" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Approvals {pendingCount > 0 && <span className="ml-1 bg-destructive/15 text-destructive py-0.5 px-1.5 rounded-full text-[10px]">{pendingCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">Activity Log</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="approvals" className="m-0 focus-visible:outline-none">
            <ScrollArea className="h-72">
              {isApprovalsLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : pendingCount === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <CheckCircle className="h-8 w-8 text-emerald-500/50 mb-2" />
                  <p className="text-sm text-muted-foreground">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingApprovals?.map((approval) => (
                    <div key={approval.id} className="p-4 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            Pending {approval.approval_level.toUpperCase()} Approval
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {approval.vendor_assignments?.vendors?.name} - {approval.vendor_assignments?.service_categories?.event_programs?.program_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-2 font-mono">
                            Requested {formatDistanceToNow(new Date(approval.requested_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="activity" className="m-0 focus-visible:outline-none">
            <ScrollArea className="h-72">
              {isActivityLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : !activities?.length ? (
                <div className="p-8 text-center">
                  <Activity className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activities.slice(0, 10).map((log) => (
                    <div key={log.id} className="p-4 hover:bg-muted transition-colors cursor-pointer">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{log.actor?.name || 'System'}</span> {log.description}
                      </p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1 font-mono">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t border-border bg-secondary/50 text-center">
              <a href="/dashboard" onClick={() => setOpen(false)} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all activity on dashboard</a>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
