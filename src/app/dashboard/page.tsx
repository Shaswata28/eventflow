import { createClient } from '@/lib/supabase/server'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h3 className="text-2xl font-semibold leading-6 text-foreground">
          Dashboard Overview
        </h3>
        <p className="mt-2 max-w-4xl text-sm text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>
      
      <DashboardMetrics />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-6">
          <ActivityFeed />
        </div>
        
        {/* Placeholder for future upcoming events calendar summary */}
        <div className="bg-surface rounded-[12px] border border-border shadow-sm p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-muted-foreground border border-border">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-foreground">Upcoming Events</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">A snapshot of your week will appear here soon.</p>
        </div>
      </div>
    </div>
  )
}
