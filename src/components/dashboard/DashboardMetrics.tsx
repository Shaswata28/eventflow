"use client"

import { useDashboardMetrics } from '@/lib/hooks/useDashboardMetrics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useProfile } from '@/lib/hooks/useProfile'
import { CalendarDays, Users, CheckSquare, Briefcase } from 'lucide-react'

export function DashboardMetrics() {
  const { data: profile } = useProfile()
  const { data: metrics, isLoading } = useDashboardMetrics(profile?.role as any)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1,2,3,4].map(i => (
          <Card key={i} className="bg-surface border-border rounded-[12px] shadow-none">
            <CardHeader className="pb-2"><div className="h-4 bg-muted rounded w-1/2"></div></CardHeader>
            <CardContent><div className="h-8 bg-muted rounded w-1/4"></div></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Customize which metrics to show based on role, or just show all for now
  const cards = [
    { title: 'Active Programs', value: metrics?.activePrograms || 0, icon: CalendarDays, color: 'text-blue-600 bg-blue-100' },
    { title: 'Total Clients', value: metrics?.totalClients || 0, icon: Users, color: 'text-indigo-600 bg-indigo-100' },
    { title: 'Pending Approvals', value: metrics?.pendingApprovals || 0, icon: CheckSquare, color: 'text-amber-600 bg-amber-100' },
    { title: 'Vendors Confirmed', value: metrics?.vendorsConfirmed || 0, icon: Briefcase, color: 'text-emerald-600 bg-emerald-100' },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <Card key={idx} className="bg-surface border border-border shadow-none rounded-[12px]">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-[28px] font-semibold text-foreground tracking-tight">{card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
