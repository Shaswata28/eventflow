import { createClient } from '@/lib/supabase/server'
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { UpcomingEvents } from '@/components/dashboard/UpcomingEvents'
import { DashboardChecklist } from '@/components/dashboard/DashboardChecklist'
import { Sparkles } from 'lucide-react'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

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

  return (
    <div className="space-y-8 pb-10">
      {/* Minimalist Header section */}
      <DashboardHeader userName={userName} />
      
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
