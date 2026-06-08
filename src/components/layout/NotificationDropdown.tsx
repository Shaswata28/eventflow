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
      <PopoverTrigger className="relative p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <span className="sr-only">View notifications</span>
        <Bell className="h-5 w-5" aria-hidden="true" />
        {hasNotifications && (
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
        )}
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 mr-4 mt-1 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden" align="end">
        <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
        </div>
        
        <Tabs defaultValue="approvals" className="w-full">
          <div className="px-4 pt-2">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="approvals" className="text-xs">
                Approvals {pendingCount > 0 && <span className="ml-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 py-0.5 px-1.5 rounded-full text-[10px]">{pendingCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">Activity Log</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="approvals" className="m-0 focus-visible:outline-none">
            <ScrollArea className="h-72">
              {isApprovalsLoading ? (
                <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
              ) : pendingCount === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400 mb-2" />
                  <p className="text-sm text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {pendingApprovals?.map((approval) => (
                    <div key={approval.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Pending {approval.approval_level.toUpperCase()} Approval
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {approval.vendor_assignments?.vendors?.name} - {approval.vendor_assignments?.service_categories?.event_programs?.program_name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-2">
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
                <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
              ) : !activities?.length ? (
                <div className="p-8 text-center">
                  <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {activities.slice(0, 10).map((log) => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-medium">{log.actor?.name || 'System'}</span> {log.description}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-center">
              <a href="/dashboard" onClick={() => setOpen(false)} className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800">View all activity on dashboard</a>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
