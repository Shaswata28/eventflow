import { createClient } from '@/lib/supabase/server'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents'
import { DashboardChecklist } from '@/components/dashboard/DashboardChecklist'
import { Sparkles } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let userName = user?.email
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', user.id)
      .single()
      
    const profileData = profile as any
    if (profileData?.name) {
      userName = profileData.name
    }
  }

  // Get current time of day for greeting
  const hour = new Date().getHours()
  let greeting = 'Good evening'
  if (hour < 12) greeting = 'Good morning'
  else if (hour < 18) greeting = 'Good afternoon'

  return (
    <div className="space-y-8 pb-10">
      {/* Minimalist Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 pt-2 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {greeting}, {userName?.split(' ')[0]}
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening across your event portfolio today.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '100ms' }}>
        <DashboardMetrics />
      </div>

      {/* Grid Layout: Activity, Checklist & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '200ms' }}>
          <DashboardChecklist />
        </div>
        <div className="lg:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '300ms' }}>
          <ActivityFeed />
        </div>
        <div className="lg:col-span-1 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationFillMode: 'both', animationDelay: '400ms' }}>
          <UpcomingEvents />
        </div>
      </div>
    </div>
  )
}
