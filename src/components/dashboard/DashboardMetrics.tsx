"use client"

import { useDashboardMetrics } from '@/lib/hooks/useDashboardMetrics'
import { useProfile } from '@/lib/hooks/useProfile'
import { Calendar, Users, FileText, Store } from 'lucide-react'

export function DashboardMetrics() {
  const { data: profile } = useProfile()
  const { data: metrics, isLoading } = useDashboardMetrics(profile?.role as any)

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse"></div>
          </div>
        ))}
      </section>
    )
  }

  const cards = [
    { 
      title: 'Active Programs', 
      value: metrics?.activePrograms || 0, 
      icon: Calendar,
      color: 'text-blue-500',
      bgLight: 'bg-blue-50',
      bgDark: 'dark:bg-blue-900/20',
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Total Clients', 
      value: metrics?.totalClients || 0, 
      icon: Users,
      color: 'text-indigo-500',
      bgLight: 'bg-indigo-50',
      bgDark: 'dark:bg-indigo-900/20',
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      title: 'Pending Approvals', 
      value: metrics?.pendingApprovals || 0, 
      icon: FileText,
      color: 'text-amber-500',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-900/20',
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'Vendors Confirmed', 
      value: metrics?.vendorsConfirmed || 0, 
      icon: Store,
      color: 'text-emerald-500',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-900/20',
      gradient: 'from-emerald-500 to-teal-500'
    },
  ]

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div 
            key={idx} 
            className="group relative bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
          >
            {/* Background Glow */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-5 group-hover:opacity-10 rounded-full blur-2xl transition-opacity duration-500`} />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.bgLight} ${card.bgDark} ${card.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {card.title}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
